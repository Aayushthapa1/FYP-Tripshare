import { Server } from "socket.io";
// Import the notification controller
import * as notificationController from "../controllers/notificationController.js";
import { setIO } from "./SocketUtils.js";

const setupSocketServer = (server) => {
  console.log("🔌 Setting up Socket.IO server...");

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Frontend URL
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    },
    pingTimeout: 60000, // Increase timeout for better connection stability
    connectionStateRecovery: {
      // Enable state recovery for better reliability
      maxDisconnectionDuration: 5 * 60 * 1000, // 5 minutes
    },
  });

  setIO(io);

  // Store online users with their socket IDs, roles, and locations
  const onlineUsers = new Map();

  // Map to track connection IDs to user IDs for reconnection
  const connectionMap = new Map();

  // Make onlineUsers available globally
  global.onlineUsers = onlineUsers;

  // Debug helper to log active users
  const logActiveUsers = (forceLog = false) => {
    // Store count by role
    const counts = {
      total: onlineUsers.size,
      driver: 0,
      user: 0,
      other: 0,
    };

    // Count by role
    onlineUsers.forEach((data) => {
      if (data.role === "driver") counts.driver++;
      else if (data.role === "user") counts.user++;
      else counts.other++;
    });

    console.log(
      `\n========== ACTIVE USERS (${counts.total}) [🚗 ${counts.driver} Drivers | 👤 ${counts.user} Passengers] ==========`
    );

    if (counts.total === 0) {
      console.log("No active users connected");
    } else {
      console.log("ID | Role | Socket | Status");
      console.log("----------------------------------");
      onlineUsers.forEach((data, userId) => {
        const statusEmoji = data.available ? "✅" : "❌";
        const roleEmoji = data.role === "driver" ? "🚗" : "👤";
        console.log(
          `${userId} | ${roleEmoji} ${data.role} | ${data.socketId} | ${statusEmoji}`
        );
      });
    }
    console.log("==========================================================\n");

    // Return counts for potential further use
    return counts;
  };

  // Helper to broadcast active users count to admins
  const broadcastActiveUsersToAdmin = () => {
    try {
      const counts = {
        total: onlineUsers.size,
        driver: 0,
        user: 0,
        other: 0,
      };

      // Count by role
      onlineUsers.forEach((data) => {
        if (data.role === "driver") counts.driver++;
        else if (data.role === "user") counts.user++;
        else counts.other++;
      });

      // Emit to all admins
      io.to("role:Admin").emit("active_users_update", counts);

      return counts;
    } catch (error) {
      console.error("❌ Error broadcasting active users to admin:", error);
    }
  };

  // Set up heartbeat to periodically check and log active users (every 30 seconds)
  const heartbeatInterval = setInterval(() => {
    // Clean up any stale connections that might not have been properly disconnected
    const staleSockets = [];

    onlineUsers.forEach((userData, userId) => {
      const socket = io.sockets.sockets.get(userData.socketId);
      if (!socket || !socket.connected) {
        staleSockets.push(userId);
      }
    });

    // Remove stale sockets
    if (staleSockets.length > 0) {
      console.log(`🧹 Cleaning up ${staleSockets.length} stale connections`);
      staleSockets.forEach((userId) => {
        onlineUsers.delete(userId);
      });
    }

    // Log active users
    const counts = logActiveUsers(true);

    // Broadcast to admins
    broadcastActiveUsersToAdmin();
  }, 30000);

  // Handle socket connections
  io.on("connection", async (socket) => {
    console.log(`🟢 New client connected: ${socket.id}`);

    // Check if this is a reconnection by checking auth data
    const { connectionId, userId, userRole } = socket.handshake.auth || {};

    if (connectionId && userId) {
      console.log(
        `🔄 This appears to be a reconnection: ${connectionId} for user ${userId}`
      );
      connectionMap.set(connectionId, userId);

      // Update the socket ID in the onlineUsers map if user exists
      if (onlineUsers.has(userId)) {
        const userData = onlineUsers.get(userId);
        userData.socketId = socket.id;
        console.log(`🔄 Updated socket ID for existing user ${userId}`);

        // Store on the socket for easier access
        socket.userId = userId;
        socket.userRole = userRole || userData.role;

        // Join role-based room
        socket.join(`role:${socket.userRole}`);

        // Emit acknowledgment
        socket.emit("connection_acknowledged", {
          status: "success",
          message: "Successfully reconnected to socket server",
          userId: userId,
          role: socket.userRole,
        });
      }
    }

    // Set up error handler for this socket
    socket.on("error", (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });

    // User connects and authenticates
    socket.on("user_connected", (userData) => {
      try {
        // Validate userData
        if (!userData || !userData.userId) {
          console.error("❌ Invalid userData received:", userData);
          return;
        }

        console.log(
          `🔗 User connected: ${userData.userId} (${userData.role || "unknown role"
          })`
        );

        // Store user ID in socket for easier reference
        socket.userId = userData.userId;
        socket.userRole = userData.role || "user";

        // Join role-based room for targeted broadcasts
        socket.join(`role:${socket.userRole}`);

        // Store connection ID if provided
        if (userData.connectionId) {
          connectionMap.set(userData.connectionId, userData.userId);
        }

        // Store user data in the map (create or update)
        onlineUsers.set(userData.userId, {
          socketId: socket.id,
          role: userData.role || "user",
          location: userData.location || null,
          available: true, // Default to available
          lastSeen: new Date(),
        });

        // Log all active users for debugging
        logActiveUsers();

        // Emit acknowledgment back to the client
        socket.emit("connection_acknowledged", {
          status: "success",
          message: "Successfully connected to socket server",
          userId: userData.userId,
          role: userData.role,
        });
      } catch (error) {
        console.error("❌ Error in user_connected handler:", error);
        socket.emit("error", { message: "Failed to process user connection" });
      }
    });

    // When a driver creates a new trip
    // When a driver creates a new trip
    socket.on("trip_created", async (tripData) => {
      try {
        console.log(`🚕 New trip created by driver: ${tripData.driverId}`);
        console.log("📍 Trip details:", {
          from: tripData.fromLocation || "Unknown",
          to: tripData.toLocation || "Unknown",
          departure: tripData.departureTime || "Not specified",
          vehicleType: tripData.vehicleType || "Not specified",
          seats: tripData.availableSeats || "Not specified",
        });

        // Create notification for the driver (confirmation)
        await notificationController.createSystemNotification(
          tripData.driverId,
          `Your trip from ${tripData.fromLocation} to ${tripData.toLocation} has been created successfully.`,
          "trip_created",
          {
            tripId: tripData.tripId,
            fromLocation: tripData.fromLocation,
            toLocation: tripData.toLocation,
            departureTime: tripData.departureTime,
            availableSeats: tripData.availableSeats,
          }
        );

        try {
          // IMPORTANT: Create notifications for ALL users in the database
          // This assumes you have a function to get all user IDs
          const allUserIds = await notificationController.getAllUserIds();

          console.log(`📢 Creating trip notifications for ${allUserIds.length} users in the database`);

          // Create notifications for all users EXCEPT the driver who created the trip
          for (const userId of allUserIds) {
            // Skip the driver who created the trip
            if (userId === tripData.driverId) continue;

            // Create notification in database
            await notificationController.createSystemNotification(
              userId,
              `New trip available from ${tripData.fromLocation} to ${tripData.toLocation} (${tripData.departureTime})`,
              "new_trip",
              {
                tripId: tripData.tripId,
                driverId: tripData.driverId,
                driverName: tripData.driverName,
                fromLocation: tripData.fromLocation,
                toLocation: tripData.toLocation,
                departureTime: tripData.departureTime,
                availableSeats: tripData.availableSeats,
                vehicleType: tripData.vehicleType,
              }
            );
          }
        } catch (err) {
          console.error("❌ Error creating notifications for all users:", err);
          // Continue execution - we'll still try to notify online users
        }

        // NOTIFY ONLINE USERS via socket
        const onlineUserCount = notifyOnlineUsersAboutTrip(io, onlineUsers, tripData);

        console.log(`🔔 Notified ${onlineUserCount} online users about the new trip`);

        // Emit acknowledgment back to the driver
        socket.emit("trip_creation_confirmed", {
          status: "success",
          message: "Trip created successfully and users have been notified",
          tripId: tripData.tripId,
          timestamp: new Date(),
        });

        // Also notify admins about the new trip
        io.to("role:Admin").emit("trip_created", {
          ...tripData,
          timestamp: new Date()
        });

      } catch (error) {
        console.error("❌ Error in trip_created handler:", error);

        // Emit error to the driver
        socket.emit("trip_creation_error", {
          status: "error",
          message: "Failed to process trip creation",
          error: error.message,
        });
      }
    });

    // Helper function to notify all online users about a new trip
    function notifyOnlineUsersAboutTrip(io, onlineUsers, tripData) {
      let notifiedCount = 0;

      // First, identify all online users (role: "user")
      const usersToNotify = [];

      onlineUsers.forEach((userData, userId) => {
        // Only include users, not drivers, and exclude the driver who created the trip
        if (userData.role === "user" && userId !== tripData.driverId) {
          usersToNotify.push({
            userId,
            socketId: userData.socketId,
          });
        }
      });

      console.log(`🔍 Found ${usersToNotify.length} online users to notify about new trip`);

      // Notify each online user
      usersToNotify.forEach((user) => {
        console.log(`📨 Notifying user ${user.userId} via socket ${user.socketId}`);

        // Emit the event to the user's socket
        io.to(user.socketId).emit("new_trip_available", {
          tripId: tripData.tripId,
          driverId: tripData.driverId,
          driverName: tripData.driverName,
          fromLocation: tripData.fromLocation,
          toLocation: tripData.toLocation,
          departureTime: tripData.departureTime,
          availableSeats: tripData.availableSeats,
          vehicleType: tripData.vehicleType,
          timestamp: new Date(),
        });

        notifiedCount++;
      });

      // IMPORTANT: Also broadcast to ALL users via role-based room
      // Using io.to() instead of socket.to() to ensure it reaches everyone
      io.to("role:user").emit("new_trip_available", {
        tripId: tripData.tripId,
        driverId: tripData.driverId,
        driverName: tripData.driverName,
        fromLocation: tripData.fromLocation,
        toLocation: tripData.toLocation,
        departureTime: tripData.departureTime,
        availableSeats: tripData.availableSeats,
        vehicleType: tripData.vehicleType,
        timestamp: new Date(),
      });

      return notifiedCount;
    }

    // When a user requests a ride
    socket.on("ride_requested", async (rideData) => {
      try {
        console.log("🚖 New ride requested from:", rideData.passengerId);
        console.log("📍 Ride details:", {
          pickupLocation: rideData.pickupLocationName || "Unknown location",
          dropoffLocation:
            rideData.dropoffLocationName || "Unknown destination",
          vehicleType: rideData.vehicleType || "Any",
          fare: rideData.fare || "Not specified",
        });

        // Create notification for the passenger
        await notificationController.createSystemNotification(
          rideData.passengerId,
          `Your ride request from ${rideData.pickupLocationName} to ${rideData.dropoffLocationName} has been submitted.`,
          "ride_request",
          {
            rideId: rideData.rideId,
            pickupLocation: rideData.pickupLocation,
            dropoffLocation: rideData.dropoffLocation,
            fare: rideData.fare,
            vehicleType: rideData.vehicleType,
          }
        );

        // Find nearby drivers based on vehicle type
        const nearbyDrivers = [];

        // Find drivers with the requested vehicle type
        onlineUsers.forEach((userData, userId) => {
          if (userData.role === "driver" && userData.available) {
            console.log(`🚗 Found online driver: ${userId}`);

            // In a real app, you would calculate distance between pickup and driver location
            // For now, notify all available drivers
            nearbyDrivers.push({
              driverId: userId,
              socketId: userData.socketId,
            });
          }
        });

        console.log(
          `🔍 Found ${nearbyDrivers.length} potential drivers for ride request`
        );

        // Notify each nearby driver
        nearbyDrivers.forEach(async (driver) => {
          console.log(
            `📨 Notifying driver ${driver.driverId} via socket ${driver.socketId}`
          );

          // Create a notification in the database for each driver
          await notificationController.createSystemNotification(
            driver.driverId,
            `New ride request from ${rideData.pickupLocationName} to ${rideData.dropoffLocationName} (${rideData.fare} NPR)`,
            "ride_request",
            {
              rideId: rideData.rideId,
              passengerId: rideData.passengerId,
              passengerName: rideData.passengerName,
              pickupLocation: rideData.pickupLocation,
              dropoffLocation: rideData.dropoffLocation,
              pickupLocationName: rideData.pickupLocationName,
              dropoffLocationName: rideData.dropoffLocationName,
              fare: rideData.fare,
              distance: rideData.distance,
              vehicleType: rideData.vehicleType,
            }
          );

          // Emit the event to the driver's socket
          io.to(driver.socketId).emit("new_ride_request", {
            rideId: rideData.rideId,
            passengerId: rideData.passengerId,
            passengerName: rideData.passengerName,
            pickupLocation: rideData.pickupLocation,
            dropoffLocation: rideData.dropoffLocation,
            pickupLocationName: rideData.pickupLocationName,
            dropoffLocationName: rideData.dropoffLocationName,
            fare: rideData.fare,
            distance: rideData.distance,
            vehicleType: rideData.vehicleType,
            timestamp: new Date(),
          });
        });

        // Also try to emit via role:driver for any newly connected drivers not yet in onlineUsers
        io.to("role:driver").emit("driver_ride_request", {
          rideId: rideData.rideId,
          passengerId: rideData.passengerId,
          passengerName: rideData.passengerName,
          pickupLocation: rideData.pickupLocation,
          dropoffLocation: rideData.dropoffLocation,
          pickupLocationName: rideData.pickupLocationName || "Unknown location",
          dropoffLocationName:
            rideData.dropoffLocationName || "Unknown destination",
          fare: rideData.fare,
          distance: rideData.distance,
          vehicleType: rideData.vehicleType,
          timestamp: new Date(),
        });

        // Notify the passenger about how many drivers were notified
        const passengerSocketId = onlineUsers.get(
          rideData.passengerId
        )?.socketId;
        if (passengerSocketId) {
          console.log(
            `📨 Notifying passenger ${rideData.passengerId} that ${nearbyDrivers.length} drivers were notified`
          );
          io.to(passengerSocketId).emit("drivers_notified", {
            rideId: rideData.rideId,
            count: nearbyDrivers.length,
            timestamp: new Date(),
          });
        } else {
          console.warn(
            `⚠️ Cannot notify passenger ${rideData.passengerId}: Not connected to socket`
          );

          // Try to find them in the connected sockets and update onlineUsers
          const sockets = await io.fetchSockets();
          for (const s of sockets) {
            if (s.userId === rideData.passengerId) {
              console.log(
                `🔄 Found passenger socket ${s.id} for user ${rideData.passengerId}, updating onlineUsers`
              );
              onlineUsers.set(rideData.passengerId, {
                socketId: s.id,
                role: s.userRole || "user",
                location: null,
                available: true,
                lastSeen: new Date(),
              });

              io.to(s.id).emit("drivers_notified", {
                rideId: rideData.rideId,
                count: nearbyDrivers.length,
                timestamp: new Date(),
              });
              break;
            }
          }
        }
      } catch (error) {
        console.error("❌ Error in ride_requested handler:", error);
      }
    });

    // When a driver accepts a ride
    socket.on("ride_accepted", async (data) => {
      try {
        console.log(
          `✅ Ride ${data.rideId} accepted by driver: ${data.driverId}`
        );

        // Create notification for passenger
        await notificationController.createSystemNotification(
          data.passengerId,
          `Driver ${data.driverName || "someone"
          } has accepted your ride and is on the way!`,
          "ride_accepted",
          {
            rideId: data.rideId,
            driverId: data.driverId,
            driverName: data.driverName,
            estimatedArrival: data.estimatedArrival,
          }
        );

        // Mark driver as unavailable for other rides
        if (onlineUsers.has(data.driverId)) {
          const driverData = onlineUsers.get(data.driverId);
          driverData.available = false;
          driverData.lastSeen = new Date();
          onlineUsers.set(data.driverId, driverData);
          console.log(
            `🚫 Driver ${data.driverId} marked as unavailable for other rides`
          );
        }

        // Notify passenger through socket
        const passengerSocketId = onlineUsers.get(data.passengerId)?.socketId;
        if (passengerSocketId) {
          console.log(
            `📨 Notifying passenger ${data.passengerId} that driver ${data.driverId} accepted the ride`
          );
          io.to(passengerSocketId).emit("driver_accepted", {
            rideId: data.rideId,
            driverId: data.driverId,
            driverName: data.driverName,
            driverLocation: data.driverLocation,
            estimatedArrival: data.estimatedArrival,
            timestamp: new Date(),
          });
        } else {
          console.warn(
            `⚠️ Cannot notify passenger ${data.passengerId}: Not connected to socket`
          );

          // Try direct broadcast on ride ID room
          io.to(`ride:${data.rideId}`).emit("driver_accepted", {
            rideId: data.rideId,
            driverId: data.driverId,
            driverName: data.driverName,
            driverLocation: data.driverLocation,
            estimatedArrival: data.estimatedArrival,
            timestamp: new Date(),
          });
        }

        // Log active users
        logActiveUsers();
      } catch (error) {
        console.error("❌ Error in ride_accepted handler:", error);
      }
    });

    // Join a specific ride room
    socket.on("join_ride_room", (data) => {
      try {
        if (!data || !data.rideId) {
          console.error("❌ Invalid ride room join request");
          return;
        }

        const roomName = `ride:${data.rideId}`;
        socket.join(roomName);
        console.log(`🔗 Socket ${socket.id} joined room ${roomName}`);
      } catch (error) {
        console.error("❌ Error in join_ride_room handler:", error);
      }
    });

    // Join a specific trip room
    socket.on("join_trip_room", (data) => {
      try {
        if (!data || !data.tripId) {
          console.error("❌ Invalid trip room join request");
          return;
        }

        const roomName = `trip:${data.tripId}`;
        socket.join(roomName);
        console.log(`🔗 Socket ${socket.id} joined trip room ${roomName}`);
      } catch (error) {
        console.error("❌ Error in join_trip_room handler:", error);
      }
    });

    // When a ride status changes
    socket.on("ride_status_updated", async (data) => {
      try {
        const newStatus = data.status || data.newStatus;
        console.log(`🔄 Ride ${data.rideId} status updated to: ${newStatus}`);

        // If ride completed or canceled, mark driver as available again
        if (newStatus === "completed" || newStatus === "canceled") {
          if (data.driverId && onlineUsers.has(data.driverId)) {
            const driverData = onlineUsers.get(data.driverId);
            driverData.available = true;
            driverData.lastSeen = new Date();
            onlineUsers.set(data.driverId, driverData);
            console.log(
              `✅ Driver ${data.driverId} is now available for new rides`
            );
          }

          // Create notification based on status
          const message =
            newStatus === "completed"
              ? "Your ride has been completed successfully!"
              : `Ride was canceled: ${data.cancelReason || "No reason provided"
              }`;

          await notificationController.createSystemNotification(
            data.passengerId,
            message,
            `ride_${newStatus}`,
            { rideId: data.rideId }
          );
        }

        // Notify both passenger and driver
        const passengerSocketId = onlineUsers.get(data.passengerId)?.socketId;
        const driverSocketId = onlineUsers.get(data.driverId)?.socketId;

        const statusUpdate = {
          rideId: data.rideId,
          status: newStatus,
          previousStatus: data.previousStatus,
          message: data.message || `Ride status updated to ${newStatus}`,
          timestamp: new Date(),
          updatedBy: data.updatedBy,
          cancelReason: data.cancelReason,
        };

        // Try to notify via individual sockets first
        let passengerNotified = false;
        let driverNotified = false;

        if (passengerSocketId) {
          console.log(
            `📨 Notifying passenger ${data.passengerId} about status change via direct socket`
          );
          io.to(passengerSocketId).emit("ride_status_changed", statusUpdate);
          passengerNotified = true;
        }

        if (driverSocketId) {
          console.log(
            `📨 Notifying driver ${data.driverId} about status change via direct socket`
          );
          io.to(driverSocketId).emit("ride_status_changed", statusUpdate);
          driverNotified = true;
        }

        // Fallback to room-based notification
        if (!passengerNotified || !driverNotified) {
          console.log(
            `📨 Broadcasting status change to ride room: ride:${data.rideId}`
          );
          io.to(`ride:${data.rideId}`).emit(
            "ride_status_changed",
            statusUpdate
          );
        }

        // Notify admins about status change
        io.to("role:Admin").emit("ride_status_changed", statusUpdate);

        // Log active users
        logActiveUsers();
      } catch (error) {
        console.error("❌ Error in ride_status_updated handler:", error);
      }
    });

    // When trip status changes
    socket.on("trip_status_updated", async (data) => {
      try {
        const newStatus = data.status || data.newStatus;
        console.log(`🔄 Trip ${data.tripId} status updated to: ${newStatus}`);

        // Create notifications based on status
        if (newStatus === "completed" || newStatus === "canceled") {
          // Notify all passengers booked on this trip
          if (data.passengerIds && Array.isArray(data.passengerIds)) {
            for (const passengerId of data.passengerIds) {
              const message =
                newStatus === "completed"
                  ? `Your trip from ${data.fromLocation} to ${data.toLocation} has been completed.`
                  : `Trip from ${data.fromLocation} to ${data.toLocation} was canceled: ${data.cancelReason || "No reason provided"}`;

              await notificationController.createSystemNotification(
                passengerId,
                message,
                `trip_${newStatus}`,
                {
                  tripId: data.tripId,
                  fromLocation: data.fromLocation,
                  toLocation: data.toLocation
                }
              );

              // Notify passenger via socket if online
              const passengerSocketId = onlineUsers.get(passengerId)?.socketId;
              if (passengerSocketId) {
                io.to(passengerSocketId).emit("trip_status_changed", {
                  tripId: data.tripId,
                  status: newStatus,
                  message: message,
                  timestamp: new Date()
                });
              }
            }
          }

          // If it's a driver-created trip, notify the driver
          if (data.driverId) {
            await notificationController.createSystemNotification(
              data.driverId,
              `Your trip from ${data.fromLocation} to ${data.toLocation} has been ${newStatus}.`,
              `trip_${newStatus}`,
              { tripId: data.tripId }
            );

            // Notify driver via socket if online
            const driverSocketId = onlineUsers.get(data.driverId)?.socketId;
            if (driverSocketId) {
              io.to(driverSocketId).emit("trip_status_changed", {
                tripId: data.tripId,
                status: newStatus,
                timestamp: new Date()
              });
            }
          }
        }

        // Broadcast to the trip room
        io.to(`trip:${data.tripId}`).emit("trip_status_changed", {
          tripId: data.tripId,
          status: newStatus,
          previousStatus: data.previousStatus,
          message: data.message || `Trip status updated to ${newStatus}`,
          timestamp: new Date(),
          updatedBy: data.updatedBy,
          cancelReason: data.cancelReason
        });

        // Notify admins
        io.to("role:Admin").emit("trip_status_changed", {
          tripId: data.tripId,
          status: newStatus,
          previousStatus: data.previousStatus,
          timestamp: new Date()
        });

      } catch (error) {
        console.error("❌ Error in trip_status_updated handler:", error);
      }
    });

    // Driver location updates during ride
    socket.on("driver_location_update", (data) => {
      try {
        // Only log occasionally to avoid console spam
        if (Math.random() < 0.01) {
          console.log(`📍 Driver location update for ride ${data.rideId}`);
        }

        // Update last seen for this driver
        if (socket.userId && onlineUsers.has(socket.userId)) {
          const userData = onlineUsers.get(socket.userId);
          userData.lastSeen = new Date();
          onlineUsers.set(socket.userId, userData);
        }

        const passengerSocketId = onlineUsers.get(data.passengerId)?.socketId;

        if (passengerSocketId) {
          io.to(passengerSocketId).emit("driver_location_changed", {
            rideId: data.rideId,
            location: data.location,
            estimatedArrival: data.estimatedArrival,
            timestamp: new Date(),
          });
        } else {
          // Use ride room as fallback
          io.to(`ride:${data.rideId}`).emit("driver_location_changed", {
            rideId: data.rideId,
            location: data.location,
            estimatedArrival: data.estimatedArrival,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error("❌ Error in driver_location_update handler:", error);
      }
    });

    // Track driver availability
    socket.on("driver_availability_update", (data) => {
      try {
        const userId = socket.userId;
        if (!userId) return;

        console.log(
          `🔄 Driver ${userId} availability update:`,
          data.available ? "Available" : "Unavailable"
        );

        // Update driver in the online users map
        if (onlineUsers.has(userId)) {
          const userData = onlineUsers.get(userId);
          userData.available = data.available;
          userData.location = data.location || userData.location;
          userData.lastSeen = new Date();
          onlineUsers.set(userId, userData);
        }

        // Notify admins about driver availability
        io.to("role:Admin").emit("driver_availability_update", {
          driverId: userId,
          available: data.available,
          location: data.location,
          timestamp: new Date()
        });
      } catch (error) {
        console.error("❌ Error in driver_availability_update handler:", error);
      }
    });

    // Handle driver announcing availability for rides
    socket.on("driver_available", (data) => {
      try {
        const driverId = data.driverId || socket.userId;

        if (!driverId) {
          console.warn(
            "⚠️ Cannot register driver availability: No driver ID provided"
          );
          return;
        }

        console.log(`✅ Driver ${driverId} is now available for rides`);

        if (onlineUsers.has(driverId)) {
          const userData = onlineUsers.get(driverId);
          userData.available = true;
          userData.vehicleType = data.vehicleType || userData.vehicleType;
          userData.location = data.location || userData.location;
          userData.lastSeen = new Date();
          onlineUsers.set(driverId, userData);
        } else {
          // Driver not in onlineUsers yet, add them
          onlineUsers.set(driverId, {
            socketId: socket.id,
            role: "driver",
            vehicleType: data.vehicleType || "Car",
            available: true,
            location: data.location || null,
            lastSeen: new Date(),
          });

          // Also make sure we have the userId on the socket
          socket.userId = driverId;
          socket.userRole = "driver";

          // Join the driver role room
          socket.join("role:driver");
        }

        // Log active users after updating
        logActiveUsers();
      } catch (error) {
        console.error("❌ Error in driver_available handler:", error);
      }
    });

    // Chat room handling
    socket.on("join_chat_room", (data) => {
      try {
        if (!data || !data.rideId) {
          console.error("❌ Invalid chat room join request");
          return;
        }

        const roomName = `chat:${data.rideId}`;
        socket.join(roomName);
        console.log(`🔗 Socket ${socket.id} joined chat room ${roomName}`);

        // Also join the general ride room
        socket.join(`ride:${data.rideId}`);
      } catch (error) {
        console.error("❌ Error in join_chat_room handler:", error);
      }
    });

    socket.on("leave_chat_room", (data) => {
      try {
        if (!data || !data.rideId) {
          console.error("❌ Invalid chat room leave request");
          return;
        }

        const roomName = `chat:${data.rideId}`;
        socket.leave(roomName);
        console.log(`🔗 Socket ${socket.id} left chat room ${roomName}`);
      } catch (error) {
        console.error("❌ Error in leave_chat_room handler:", error);
      }
    });

    socket.on("send_message", async (data) => {
      try {
        if (
          !data ||
          !data.rideId ||
          !data.sender ||
          !data.recipient ||
          !data.content
        ) {
          console.error("❌ Invalid message data");
          return;
        }

        console.log(
          `📝 New message in ride ${data.rideId} from ${data.sender}`
        );

        // Add status and timestamp if not provided
        const messageData = {
          ...data,
          status: data.status || "sent",
          timestamp: data.timestamp || new Date(),
          _id: data._id || `temp_${Date.now()}`,
        };

        // Broadcast to ride room
        const rideRoomName = `ride:${data.rideId}`;
        const chatRoomName = `chat:${data.rideId}`;

        socket.to(rideRoomName).emit("new_message", messageData);
        socket.to(chatRoomName).emit("new_message", messageData);

        // Also broadcast to the specific recipient if they're online
        const recipientSocketId = onlineUsers.get(data.recipient)?.socketId;
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("new_message", {
            ...messageData,
            status: "delivered",
          });
        }

        // Create notification for undelivered messages
        if (!recipientSocketId && global.createSystemNotification) {
          try {
            await global.createSystemNotification(
              data.recipient,
              `New message from ${data.senderName}: ${data.content.length > 30
                ? data.content.substring(0, 30) + "..."
                : data.content
              }`,
              "new_message",
              {
                rideId: data.rideId,
                senderId: data.sender,
                senderName: data.senderName,
                preview: data.content.substring(0, 100),
              }
            );
          } catch (err) {
            console.error("❌ Error creating notification for message:", err);
          }
        }
      } catch (error) {
        console.error("❌ Error in send_message handler:", error);
      }
    });

    socket.on("message_read", (data) => {
      try {
        if (!data || !data.messageId || !data.rideId) {
          console.error("❌ Invalid message read data");
          return;
        }

        // Notify sender that message was read
        if (data.senderId) {
          const senderSocketId = onlineUsers.get(data.senderId)?.socketId;
          if (senderSocketId) {
            io.to(senderSocketId).emit("message_status_update", {
              messageId: data.messageId,
              status: "read",
              rideId: data.rideId,
            });
          }
        }

        // Also broadcast to ride room
        socket.to(`ride:${data.rideId}`).emit("message_status_update", {
          messageId: data.messageId,
          status: "read",
        });
      } catch (error) {
        console.error("❌ Error in message_read handler:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      try {
        console.log(`🔴 Client disconnected (${socket.id}): ${reason}`);

        // Find and remove the disconnected user
        let userId = socket.userId; // Get from attached property if available

        if (!userId) {
          // Search through the map if not directly available
          for (const [id, userData] of onlineUsers.entries()) {
            if (userData.socketId === socket.id) {
              userId = id;
              break;
            }
          }
        }

        if (userId) {
          // If this is a temporary disconnect (page refresh/navigation),
          // don't immediately remove from onlineUsers
          if (reason === "transport close" || reason === "ping timeout") {
            console.log(
              `🔵 User ${userId} temporarily disconnected, keeping in active users for 30 seconds`
            );

            // Mark as inactive but don't remove yet
            if (onlineUsers.has(userId)) {
              const userData = onlineUsers.get(userId);
              userData.lastSeen = new Date();
              userData.temporarilyDisconnected = true;
              onlineUsers.set(userId, userData);
            }

            // Set timeout to remove if not reconnected within 30 seconds
            setTimeout(() => {
              const userData = onlineUsers.get(userId);
              if (userData && userData.temporarilyDisconnected) {
                const now = new Date();
                const timeSinceLastSeen = now - userData.lastSeen;

                // If it's been more than 30 seconds, remove the user
                if (timeSinceLastSeen > 30000) {
                  onlineUsers.delete(userId);
                  console.log(
                    `⏰ User ${userId} removed from online users after 30s disconnect`
                  );
                  logActiveUsers();
                  // Update active users counts for admin dashboards
                  broadcastActiveUsersToAdmin();
                }
              }
            }, 30000);
          } else {
            // For other disconnect reasons, remove immediately
            onlineUsers.delete(userId);
            console.log(`👋 User ${userId} removed from online users`);
            logActiveUsers();
            // Update active users counts for admin dashboards
            broadcastActiveUsersToAdmin();
          }
        }
      } catch (error) {
        console.error("❌ Error in disconnect handler:", error);
      }
    });
  });

  // Set up ping/healthcheck endpoint
  io.of("/").adapter.on("error", (error) => {
    console.error("❌ Socket.IO adapter error:", error);
  });

  // Log when server starts
  console.log("✅ Socket.IO server setup complete");

  // Make io available globally
  global.io = io;

  // Return cleanup function
  const cleanup = () => {
    clearInterval(heartbeatInterval);
    console.log("🧹 Socket.IO server cleanup");
  };

  return { io, cleanup };
};

export default setupSocketServer;