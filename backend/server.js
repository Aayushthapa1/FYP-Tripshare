import app from "./app.js";
import _config from "./utils/config.js";
import connectToDB from "./utils/connectToDB.js";
import http from "http";
import { Server } from "socket.io";
import Ride from "./models/handleRideModel.js"; // Ensure the Ride model is imported

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

    // 🟢 Socket.IO connection
    io.on("connection", (socket) => {
      console.log(`✅ A user connected: ${socket.id}`);

      // 🟢 Handle driver going online
      socket.on("driver-online", (driverId) => {
        console.log(`✅ Driver ${driverId} is online and joined room driver-${driverId}`);
        socket.join(`driver-${driverId}`); // Driver joins a specific room
      });

      // 🟢 Handle passenger requesting a ride
      socket.on("request-ride", async (data) => {
        console.log("🔍 Received ride request event on server:", data);

        try {
          const ride = await Ride.create({
            driverId: data.driverId,
            passengerId: data.passengerId,
            pickupLocation: data.pickupLocation,
            dropoffLocation: data.dropoffLocation,
            status: "requested",
          });

          console.log("✅ Ride saved in DB:", ride);

          // Notify the driver about the ride request
          io.to(`driver-${data.driverId}`).emit("ride-request", ride);
          console.log(`📩 Ride request sent to driver-${data.driverId}`);
        } catch (error) {
          console.error("❌ Error saving ride:", error);
        }
      });

      // 🟢 Handle driver accepting/rejecting a ride
      socket.on("ride-response", async (data) => {
        console.log("🔍 Ride response received:", data);

        try {
          const ride = await Ride.findById(data.rideId);
          if (!ride) {
            console.log("❌ Ride not found");
            return;
          }

          ride.status = data.status;
          await ride.save();

          // Notify the passenger
          io.to(`passenger-${ride.passengerId}`).emit("ride-status", {
            rideId: ride._id,
            status: ride.status,
          });

          console.log(`📩 Ride status update sent to passenger-${ride.passengerId}`);
        } catch (error) {
          console.error("❌ Error updating ride:", error);
        }
      });

      // 🟢 Handle disconnection
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
