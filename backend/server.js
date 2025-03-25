import app from "./app.js";
// Add this with your other imports at the top of server.js
import cloudinary from "./config/cloudinaryConfig.js";

import _config from "./utils/config.js";
import connectToDB from "./utils/connectToDB.js";
import ChatMessage from "./models/chatMessageModel.js";

import http from "http";
import { Server } from "socket.io";

// 6) Pull out "port" from our config
const { port } = _config;
console.log(`Port: ${port}`);

// 7) Export "io" so we can reference it in other modules if needed
export let io = null;

// 8) (Optional) Keep track of which users (by userId) are online:
//    Map<userId, socketId>
export const onlineUsers = new Map();

// Add the function to test Cloudinary connection
export const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log("Cloudinary connection successful:", result);
    return true;
  } catch (error) {
    console.error("Cloudinary connection failed:", error);
    return false;
  }
};

const startServer = async () => {
  try {
    await connectToDB();
    await testCloudinaryConnection();

    const server = http.createServer(app);
    // (C) Initialize Socket.IO on top of the HTTP server.
    io = new Server(server, {
      cors: {
        origin: "*", // For production, replace "*" with your actual client URL
      },
    });

    // (D) Setup Socket.IO connections:
    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      // (D1) Check if userId is provided in the query string
      //      e.g. client connects with: io("http://localhost:3301", { query: { userId: "abc" } })
      const { userId } = socket.handshake.query;
      if (userId) {
        // Store the mapping of userId -> socket.id
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} is online with socket ID ${socket.id}`);
      }

      // (D2) Join a specific chat room by ID. This keeps messages
      //      isolated to users in the same room.
      //      Client triggers this with: socket.emit("joinRoom", "someRoomId");
      socket.on("joinRoom", (chatRoomId) => {
        socket.join(chatRoomId);
        console.log(`Socket ${socket.id} joined room ${chatRoomId}`);
      });

      // (D3) Handle "sendMessage" events from the client.
      //      Client payload example: { chatRoomId, message, userId }
      socket.on("sendMessage", async ({ chatRoomId, message, userId }) => {
        try {
          // 1. Basic validation
          if (!chatRoomId || !message || !userId) {
            console.error("Missing data in sendMessage event");
            return;
          }

          // 2. Save the new message to MongoDB via ChatMessage model.
          //    We assume the chatRoomId might be a string referencing
          //    some other logic, but for now we store it directly.
          const newMessage = await ChatMessage.create({
            chatRoomId,
            senderId: userId,
            message,
          });

          // 3. Broadcast the newly created message to everyone in that room.
          //    They will receive an event called "receiveMessage".
          //    The data includes all fields from "newMessage".
          io.to(chatRoomId).emit("receiveMessage", newMessage);
        } catch (err) {
          console.error("Error sending message:", err);
        }
      });

      // (D4) Handle disconnections
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);

        // Remove the user from the onlineUsers map (if they had a userId)
        if (userId) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} has disconnected`);
        }
      });
    });

    app.get("/chats/:chatRoomId/messages", async (req, res) => {
      try {
        const { chatRoomId } = req.params;
        // Query the DB for all messages with that room ID
        // sorted in ascending order by creation time
        const messages = await ChatMessage.find({ chatRoomId }).sort({ createdAt: 1 });
        return res.json(messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ error: "Failed to fetch messages" });
      }
    });

    // (F) Finally, start the HTTP server on the specified port
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}...`);
    });
  } catch (error) {
    // If there's an error at any point, log it and exit
    console.error("❌ Error starting the server:", error);
    process.exit(1);
  }
};

// 9) Execute our startServer function to initialize everything
startServer();