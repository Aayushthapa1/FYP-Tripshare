// server.js
import app from "./app.js";
import _config from "./utils/config.js";
import connectToDB from "./utils/connectToDB.js";
import http from "http";
import { Server } from "socket.io";

const { port } = _config;
console.log(`Port ${port}`);

// We'll export io so we can emit events from controllers
export let io = null;

// If you want to map userId -> socketId for private messages
export const onlineUsers = new Map();

const startServer = async () => {
  try {
    // Connect to DB
    await connectToDB();

    // Create an HTTP server from your Express app
    const server = http.createServer(app);

    // Initialize Socket.IO
    io = new Server(server, {
      cors: {
        origin: "*", // or your actual client origin
      },
    });

    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      // If front end connects with e.g. io("http://localhost:3301", { query: { userId: "abc" } })
      const { userId } = socket.handshake.query;
      if (userId) {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} is online with socket ID ${socket.id}`);
      }

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        if (userId) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} has disconnected`);
        }
      });
    });

    // Finally, start the server
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}...`);
    });
  } catch (error) {
    console.error("❌ Error starting the server:", error);
    process.exit(1);
  }
};

startServer();
