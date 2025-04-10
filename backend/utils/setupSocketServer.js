// utils/setupSocketServer.js
import { Server } from "socket.io";
import ChatMessage from "../models/chatModel.js"; // Adjust import path as needed

// We export these maps so controllers can access them if desired
export const activeDrivers = new Map();
export const activePassengers = new Map();
export const activeRides = new Map();
export const activeChatUsers = new Map(); 

/**
 * Sets up the main Socket.IO server and returns the 'io' instance.
 */
export default function setupSocketServer(server) {
  // 1) Initialize Socket.IO on the passed "server"
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173/",   
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // 2) On every new connection, handle the logic
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Extract user info from query
    const userId = socket.handshake.query.userId;
    const userType = socket.handshake.query.userType || "passenger";

    // Store user connection
    if (userType === "driver") {
      activeDrivers.set(userId, { socketId: socket.id, status: "available" });
    } else {
      activePassengers.set(userId, { socketId: socket.id });
    }

    // Store user in active chat users regardless of type
    activeChatUsers.set(userId, { socketId: socket.id, userType });

    // ---------------------------
    //   Chat Message Events
    // ---------------------------

    // Handle real-time chat messages
    socket.on("sendChatMessage", async (data) => {
      try {
        const { receiverId, content, messageType = "text", senderName } = data;
        const senderId = userId;

        // Create a message in the database
        const newMessage = new ChatMessage({
          sender: senderId,
          senderType: userType === "driver" ? "Driver" : "User",
          receiver: receiverId,
          receiverType: userType === "driver" ? "User" : "Driver", // Reverse of sender
          messageType,
          content,
          read: false
        });

        const savedMessage = await newMessage.save();

        // Find receiver's socket to send real-time message
        let receiverSocketId;
        if (activeDrivers.has(receiverId)) {
          receiverSocketId = activeDrivers.get(receiverId).socketId;
        } else if (activePassengers.has(receiverId)) {
          receiverSocketId = activePassengers.get(receiverId).socketId;
        }

        // Emit new message to the receiver if they are online
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newChatMessage", {
            messageId: savedMessage._id,
            senderId,
            senderName,
            content,
            createdAt: savedMessage.createdAt,
            messageType
          });
        }

        // Send message back to sender as confirmation
        socket.emit("chatMessageSent", {
          messageId: savedMessage._id,
          receiverId,
          content,
          createdAt: savedMessage.createdAt,
          status: "sent"
        });
      } catch (error) {
        console.error("Error in sendChatMessage:", error);
        socket.emit("chatError", { message: "Failed to send message" });
      }
    });

    // Mark messages as read
    socket.on("markMessagesAsRead", async (data) => {
      try {
        const { senderId } = data;
        
        // Update database to mark messages as read
        await ChatMessage.updateMany(
          { 
            sender: senderId, 
            receiver: userId, 
            read: false 
          },
          { 
            read: true 
          }
        );

        // Notify the original sender that their messages were read
        const senderSocketId = activeChatUsers.get(senderId)?.socketId;
        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesRead", { 
            by: userId,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // ---------------------------
    //   All your existing ride events
    // ---------------------------

    // Update passenger location
    socket.on("updatePassengerLocation", (data) => {
      const { passengerId, location, lookingForRide } = data;

      if (lookingForRide) {
        // Find nearby drivers and emit to passenger
        const nearbyDrivers = findNearbyDrivers(location);
        socket.emit("nearbyDrivers", nearbyDrivers);
      }
    });

    // Update driver location
    socket.on("updateDriverLocation", (data) => {
      const { driverId, location, status } = data;

      if (activeDrivers.has(driverId)) {
        const driverInfo = activeDrivers.get(driverId);
        driverInfo.location = location;
        driverInfo.status = status || "available";
        activeDrivers.set(driverId, driverInfo);
      }

      // If driver is on a ride, update passenger about driver's location
      if (status === "on_ride") {
        const rideId = data.rideId;
        if (activeRides.has(rideId)) {
          const ride = activeRides.get(rideId);
          const passengerSocketId = activePassengers.get(ride.passengerId)?.socketId;

          if (passengerSocketId) {
            io.to(passengerSocketId).emit("driverLocationUpdate", location);
          }
        }
      }
    });

    // Find drivers for a ride
    socket.on("findDrivers", (data) => {
      const { passengerId, pickupLocation, vehicleType } = data;
      const nearbyDrivers = findNearbyDrivers(pickupLocation, vehicleType);
      socket.emit("nearbyDrivers", nearbyDrivers);
    });

    // Request a ride
    socket.on("requestRide", (rideData) => {
      const { passengerId, pickupLocation, dropoffLocation, vehicleType } = rideData;

      // Generate a unique ride ID
      const rideId = generateRideId();

      // Store ride information
      activeRides.set(rideId, {
        ...rideData,
        status: "searching",
        createdAt: new Date().toISOString(),
      });

      // Find nearby drivers
      const nearbyDrivers = findNearbyDrivers(pickupLocation, vehicleType);

      // Notify each driver about the ride request
      nearbyDrivers.forEach((driver) => {
        const driverSocketId = activeDrivers.get(driver.driverId)?.socketId;
        if (driverSocketId) {
          io.to(driverSocketId).emit("rideRequest", {
            rideId,
            passengerId,
            pickupLocation,
            dropoffLocation,
            fare: rideData.fare,
          });
        }
      });

      // Update passenger about ride status
      socket.emit("rideStatusUpdate", {
        rideId,
        status: "searching",
        message: "Looking for drivers",
      });
    });

    // Driver accepts a ride
    socket.on("acceptRide", (data) => {
      const { rideId, driverId, driverName, estimatedArrival } = data;

      if (activeRides.has(rideId)) {
        const ride = activeRides.get(rideId);
        ride.status = "accepted";
        ride.driverId = driverId;
        ride.driverName = driverName;
        ride.estimatedArrival = estimatedArrival;
        activeRides.set(rideId, ride);

        // Notify passenger
        const passengerSocketId = activePassengers.get(ride.passengerId)?.socketId;
        if (passengerSocketId) {
          io.to(passengerSocketId).emit("rideStatusUpdate", {
            rideId,
            status: "accepted",
            driverInfo: {
              driverId,
              name: driverName,
            },
            estimatedArrival,
          });
        }
      }
    });

    // Ride started
    socket.on("startRide", (data) => {
      const { rideId } = data;

      if (activeRides.has(rideId)) {
        const ride = activeRides.get(rideId);
        ride.status = "in_progress";
        ride.startTime = new Date().toISOString();
        activeRides.set(rideId, ride);

        // Notify passenger
        const passengerSocketId = activePassengers.get(ride.passengerId)?.socketId;
        if (passengerSocketId) {
          io.to(passengerSocketId).emit("rideStatusUpdate", {
            rideId,
            status: "in_progress",
            message: "Your ride has started",
          });
        }
      }
    });

    // On disconnect, remove from active connections
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Remove from appropriate maps
      if (userType === "driver") {
        for (const [id, dData] of activeDrivers.entries()) {
          if (dData.socketId === socket.id) {
            activeDrivers.delete(id);
            break;
          }
        }
      } else {
        for (const [id, pData] of activePassengers.entries()) {
          if (pData.socketId === socket.id) {
            activePassengers.delete(id);
            break;
          }
        }
      }
      
      // Also remove from chat users
      for (const [id, userData] of activeChatUsers.entries()) {
        if (userData.socketId === socket.id) {
          activeChatUsers.delete(id);
          break;
        }
      }
    });
  });

  // Helper functions remain the same...
  function findNearbyDrivers(location, vehicleType = null) {
    const nearbyDrivers = [];
    const MAX_DISTANCE = 5; // km

    for (const [driverId, driverData] of activeDrivers.entries()) {
      if (driverData.status !== "available" || !driverData.location) continue;
      if (vehicleType && driverData.vehicleType !== vehicleType) continue;

      const distance = calculateDistance(
        location.lat,
        location.lng,
        driverData.location.lat,
        driverData.location.lng
      );
      if (distance <= MAX_DISTANCE) {
        nearbyDrivers.push({
          driverId,
          name: driverData.name || `Driver ${driverId.substring(0, 5)}`,
          vehicleType: driverData.vehicleType || "Car",
          location: driverData.location,
          distance,
        });
      }
    }

    // Sort by distance ascending
    return nearbyDrivers.sort((a, b) => a.distance - b.distance);
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius (km)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  function generateRideId() {
    return (
      "ride_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9)
    );
  }

  // Finally, return the "io" instance
  return io;
}