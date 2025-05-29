import ChatMessage from "../models/ChatMessageModel.js";
import Ride from "../models/handleRideModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

// Get chat messages for a specific ride
export const getChatMessages = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id; // Get from auth middleware

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride ID format",
      });
    }

    // Find the ride to verify user has access
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // Check if user is part of this ride (either passenger or driver)
    const isPassenger = ride.passengerId.toString() === userId.toString();
    const isDriver =
      ride.driverId && ride.driverId.toString() === userId.toString();

    if (!isPassenger && !isDriver) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access these messages",
      });
    }

    // Fetch messages and sort by timestamp
    const messages = await ChatMessage.find({ rideId })
      .sort({ timestamp: 1 })
      .populate("sender", "fullName userName profileImage")
      .populate("recipient", "fullName userName profileImage");

    // Mark messages as read if recipient is current user
    const unreadMessages = messages.filter(
      (msg) =>
        msg.status !== "read" && msg.recipient.toString() === userId.toString()
    );

    // Update message status in background (don't wait for completion)
    if (unreadMessages.length > 0) {
      const updatePromise = ChatMessage.updateMany(
        {
          _id: { $in: unreadMessages.map((msg) => msg._id) },
          recipient: userId,
        },
        { $set: { status: "read" } }
      );

      // Don't await this operation to speed up response time
      updatePromise.catch((err) =>
        console.error("Error updating message status:", err)
      );

      // If we have socket.io available, emit read status
      if (global.io) {
        const senderId = unreadMessages[0].sender.toString();
        const senderSocketId = global.onlineUsers?.get(senderId)?.socketId;

        if (senderSocketId) {
          global.io.to(senderSocketId).emit("messages_read", {
            rideId,
            readerId: userId,
            timestamp: new Date(),
            messageIds: unreadMessages.map((msg) => msg._id),
          });
        }

        // Also emit to the ride room
        global.io.to(`chat:${rideId}`).emit("messages_read", {
          rideId,
          readerId: userId,
          timestamp: new Date(),
          messageIds: unreadMessages.map((msg) => msg._id),
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Chat messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    console.error("Error in getChatMessages:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve chat messages",
      error: error.message,
    });
  }
};

// Send a new chat message
export const sendChatMessage = async (req, res) => {
  try {
    console.log("📨 Message request received:", req.body);
    
    // 1. Extract and validate data from request
    const { rideId, recipient, content } = req.body;
    
    // Important: Make sure req.user is available from auth middleware
    if (!req.user || !req.user.id) {
      console.error("❌ Authentication error: req.user or req.user.id is missing");
      return res.status(401).json({
        success: false,
        message: "Authentication required. User ID not found in request.",
      });
    }
    
    const sender = req.user.id;
    console.log(`🔑 Request authenticated - Sender ID: ${sender}`);
    
    // 2. Validate required fields
    if (!rideId) {
      console.error("❌ Missing rideId");
      return res.status(400).json({
        success: false,
        message: "Missing required field: rideId",
      });
    }
    
    if (!recipient) {
      console.error("❌ Missing recipient");
      return res.status(400).json({
        success: false,
        message: "Missing required field: recipient",
      });
    }
    
    if (!content || content.trim() === "") {
      console.error("❌ Missing or empty content");
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty",
      });
    }
    
    // 3. Validate MongoDB ObjectIds
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      console.error(`❌ Invalid rideId format: ${rideId}`);
      return res.status(400).json({
        success: false,
        message: "Invalid rideId format",
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(recipient)) {
      console.error(`❌ Invalid recipient format: ${recipient}`);
      return res.status(400).json({
        success: false,
        message: "Invalid recipient format",
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(sender)) {
      console.error(`❌ Invalid sender format: ${sender}`);
      return res.status(400).json({
        success: false,
        message: "Invalid sender format",
      });
    }
    
    // 4. Verify sender exists
    let senderUser;
    try {
      senderUser = await User.findById(sender);
      if (!senderUser) {
        console.error(`❌ Sender with ID ${sender} not found in database`);
        return res.status(404).json({
          success: false,
          message: "Sender not found",
        });
      }
      console.log(`✅ Sender verified: ${senderUser.fullName || senderUser.userName}`);
    } catch (error) {
      console.error("❌ Error finding sender:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify sender",
        error: error.message,
      });
    }
    
    // 5. Verify recipient exists
    try {
      const recipientUser = await User.findById(recipient);
      if (!recipientUser) {
        console.error(`❌ Recipient with ID ${recipient} not found in database`);
        return res.status(404).json({
          success: false,
          message: "Recipient not found",
        });
      }
      console.log(`✅ Recipient verified: ${recipientUser.fullName || recipientUser.userName}`);
    } catch (error) {
      console.error("❌ Error finding recipient:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify recipient",
        error: error.message,
      });
    }
    
    // 6. Find and verify ride
    let ride;
    try {
      ride = await Ride.findById(rideId);
      if (!ride) {
        console.error(`❌ Ride with ID ${rideId} not found in database`);
        return res.status(404).json({
          success: false,
          message: "Ride not found",
        });
      }
      console.log(`✅ Ride verified, ID: ${ride._id}`);
    } catch (error) {
      console.error("❌ Error finding ride:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to verify ride",
        error: error.message,
      });
    }
    
    // 7. Check if user is part of this ride
    const isPassenger = ride.passengerId && ride.passengerId.toString() === sender.toString();
    const isDriver = ride.driverId && ride.driverId.toString() === sender.toString();
    
    console.log(`🔍 Permission check - isPassenger: ${isPassenger}, isDriver: ${isDriver}`);
    console.log(`🔢 IDs for comparison - passengerId: ${ride.passengerId}, driverId: ${ride.driverId}, sender: ${sender}`);
    
    if (!isPassenger && !isDriver) {
      console.error("❌ Permission denied: User is not part of this ride");
      return res.status(403).json({
        success: false,
        message: "You don't have permission to send messages for this ride",
      });
    }
    
    // 8. Prepare message data
    const senderName = senderUser.fullName || senderUser.userName || "User";
    
    // 9. Create and save message - CRITICAL PART
    let newMessage, savedMessage;
    try {
      console.log("📝 Creating new message object");
      newMessage = new ChatMessage({
        rideId,
        sender,
        senderName,
        recipient,
        content,
        timestamp: new Date(),
        status: "sent",
      });
      
      console.log("💾 Attempting to save message to database");
      savedMessage = await newMessage.save();
      
      console.log(`✅ Message saved successfully! ID: ${savedMessage._id}`);
    } catch (error) {
      console.error("❌ Error saving message to database:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to save message to database",
        error: error.message,
        details: error.errors ? JSON.stringify(error.errors) : undefined,
      });
    }
    
    // 10. Populate sender and recipient information
    try {
      await savedMessage.populate([
        { path: "sender", select: "fullName userName profileImage" },
        { path: "recipient", select: "fullName userName profileImage" },
      ]);
      console.log("👤 Populated message with user details");
    } catch (error) {
      console.error("⚠️ Error populating message with user details:", error);
      // Non-critical error, continue
    }
    
    // 11. Socket.io events
    if (global.io) {
      console.log("🔌 Socket.io available, sending events");
      const recipientSocketId = global.onlineUsers?.get(recipient)?.socketId;
      
      // Emit to room
      global.io.to(`chat:${rideId}`).emit("new_message", savedMessage);
      global.io.to(`ride:${rideId}`).emit("new_message", savedMessage);
      
      // Direct to recipient if online
      if (recipientSocketId) {
        global.io.to(recipientSocketId).emit("new_message", {
          ...savedMessage.toObject(),
          status: "delivered",
        });
        
        // Update status to delivered if recipient is online
        try {
          savedMessage.status = "delivered";
          await savedMessage.save();
        } catch (error) {
          console.error("⚠️ Error updating message status:", error);
          // Non-critical error, continue
        }
      }
    }
    
    // 12. Create notification if recipient is offline
    const recipientSocketId = global.onlineUsers?.get(recipient)?.socketId;
    if (!recipientSocketId && global.createSystemNotification) {
      try {
        await global.createSystemNotification(
          recipient,
          `New message from ${senderName}: ${content.length > 30 ? content.substring(0, 30) + "..." : content}`,
          "new_message",
          {
            rideId,
            senderId: sender,
            senderName,
            preview: content.substring(0, 100),
          }
        );
      } catch (error) {
        console.error("⚠️ Error creating notification:", error);
        // Non-critical error, continue
      }
    }
    
    // 13. Return success
    console.log("✅ Message sent successfully");
    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: savedMessage,
    });
    
  } catch (error) {
    console.error("❌ Unhandled error in sendChatMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.user.id; // From auth middleware

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride ID format",
      });
    }

    // Find unread messages for this ride where current user is recipient
    const unreadMessages = await ChatMessage.find({
      rideId,
      recipient: userId,
      status: { $ne: "read" },
    });

    // Update all matching messages
    const result = await ChatMessage.updateMany(
      {
        rideId,
        recipient: userId,
        status: { $ne: "read" },
      },
      { $set: { status: "read" } }
    );

    // Emit socket event if socket.io is available
    if (global.io && unreadMessages.length > 0) {
      // Group messages by sender
      const senderMessages = {};
      unreadMessages.forEach((msg) => {
        const senderId = msg.sender.toString();
        if (!senderMessages[senderId]) {
          senderMessages[senderId] = [];
        }
        senderMessages[senderId].push(msg._id);
      });

      // Notify each sender
      Object.entries(senderMessages).forEach(([senderId, messageIds]) => {
        const senderSocketId = global.onlineUsers?.get(senderId)?.socketId;

        if (senderSocketId) {
          global.io.to(senderSocketId).emit("messages_read", {
            rideId,
            readerId: userId,
            messageIds,
            timestamp: new Date(),
          });
        }
      });

      // Also broadcast to ride room
      global.io.to(`chat:${rideId}`).emit("messages_read", {
        rideId,
        readerId: userId,
        messageIds: unreadMessages.map((msg) => msg._id),
        timestamp: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
      data: {
        updatedCount: result.modifiedCount,
        messageIds: unreadMessages.map((msg) => msg._id),
      },
    });
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
};

// Get unread message count for a user
export const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    // Count unread messages across all rides
    const unreadCount = await ChatMessage.countDocuments({
      recipient: userId,
      status: { $ne: "read" },
    });

    // Group by ride for detailed counts
    const unreadByRide = await ChatMessage.aggregate([
      {
        $match: {
          recipient: mongoose.Types.ObjectId(userId),
          status: { $ne: "read" },
        },
      },
      {
        $group: {
          _id: "$rideId",
          count: { $sum: 1 },
          latestMessage: { $max: "$timestamp" },
          latestContent: { $last: "$content" },
        },
      },
      {
        $sort: { latestMessage: -1 },
      },
      {
        $lookup: {
          from: "rides", // Assuming your rides collection is named 'rides'
          localField: "_id",
          foreignField: "_id",
          as: "rideInfo",
        },
      },
      {
        $project: {
          count: 1,
          latestMessage: 1,
          latestContent: 1,
          rideInfo: { $arrayElemAt: ["$rideInfo", 0] },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Unread message count retrieved",
      data: {
        totalUnread: unreadCount,
        unreadByRide,
      },
    });
  } catch (error) {
    console.error("Error in getUnreadMessageCount:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get unread message count",
      error: error.message,
    });
  }
};