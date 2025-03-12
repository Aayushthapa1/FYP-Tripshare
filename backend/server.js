import app from "./app.js";
import _config from "./utils/config.js";
import connectToDB from "./utils/connectToDB.js";
import http from "http";
import { Server } from "socket.io";
import Ride from "./models/handleRideModel.js";
import UserModel from "./models/userModel.js"
import DriverModel from "./models/driverModel.js"
 // Ensure the Ride model is imported

const { port } = _config;
console.log(`Port ${port}`);

const startServer = async () => {
  try {
    await connectToDB(); // Ensure the database connects before starting the server

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: "*", // Allow all origins (update this in production)
      },
    });

    io.on("connection", (socket) => {
      console.log(`✅ A user connected: ${socket.id}`);
    
      socket.on("join", (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
      });
    
      socket.on("driver-online", (driverId) => {
        console.log(
          `✅ Driver ${driverId} is online and joined room driver-${driverId}`
        );
        socket.join(`driver-${driverId}`);
        io.emit("driver-available", { driverId, status: "online" });
      });
    
      socket.on("driver-offline", (driverId) => {
        console.log(`🚫 Driver ${driverId} is offline`);
        socket.leave(`driver-${driverId}`);
        io.emit("driver-available", { driverId, status: "offline" });
      });
    
      socket.on("request-ride", async (data) => {
        try {
          const ride = await Ride.create({
            passengerId: data.passengerId,
            pickupLocation: data.pickupLocation,
            dropoffLocation: data.dropoffLocation,
            pickupLocationName: data.pickupLocationName,
            dropoffLocationName: data.dropoffLocationName,
            status: "requested",
            distance: data.distance,
            estimatedTime: data.estimatedTime,
          });
    
          const passenger = await UserModel.findById(data.passengerId).select(
            "phone username"
          );
          const rideWithPassenger = {
            ...ride._doc,
            passenger: { phone: passenger.phone, username: passenger.username },
          };
    
          io.emit("ride-request", rideWithPassenger);
          socket.emit("ride-notification", {
            message: "Ride request sent to nearby drivers",
          });
        } catch (error) {
          console.error("❌ Error saving ride:", error);
        }
      });
    
      socket.on("ride-response", async (data) => {
        try {
          console.log(
            `Ride response received: rideId=${data.rideId}, driverId=${data.driverId}, status=${data.status}`
          );
          const ride = await Ride.findById(data.rideId);
          if (!ride) {
            console.error(`Ride ${data.rideId} not found`);
            return;
          }
    
          // Fetch the driver by the `user` field (which references UserModel)
          const driver = await DriverModel.findOne({ user: data.driverId });
          if (!driver) {
            console.error(
              `Driver ${data.driverId} not found in drivers collection`
            );
          } else {
            console.log(`Driver ${data.driverId} found: ${driver.fullName}`);
          }
    
          ride.driverId = data.driverId; // This should be the `user` field from the Driver model
          ride.status = data.status;
          await ride.save();
    
          // Emit the ride-status event to the passenger's room
          io.to(`passenger-${ride.passengerId}`).emit("ride-status", {
            rideId: ride._id,
            status: ride.status,
            driverId: data.driverId,
          });
    
          // Emit a notification to the driver
          io.to(`driver-${data.driverId}`).emit("ride-notification", {
            message: `Ride ${data.status}`,
          });
    
          if (data.status === "rejected") {
            // If the ride is rejected, re-emit the ride request to other drivers
            io.emit("ride-request", ride);
          }
        } catch (error) {
          console.error("❌ Error updating ride:", error);
        }
      });
    
      socket.on("ride-status-update", async (data) => {
        try {
          const ride = await Ride.findById(data.rideId);
          if (!ride) return;
    
          ride.status = data.status;
          await ride.save();
    
          io.to(`passenger-${ride.passengerId}`).emit("ride-status", {
            rideId: ride._id,
            status: ride.status,
          });
    
          io.to(`driver-${ride.driverId}`).emit("ride-notification", {
            message: `Ride status updated to ${data.status}`,
          });
        } catch (error) {
          console.error("❌ Error updating ride status:", error);
        }
      });
    
      socket.on("disconnect", () => {
        console.log(`⚠️ A user disconnected: ${socket.id}`);
      });
    });

    // Start the HTTP server after setting up Socket.IO
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}...`);
    });
  } catch (error) {
    console.error("❌ Error starting the server:", error);
    process.exit(1);
  }
};

startServer();
