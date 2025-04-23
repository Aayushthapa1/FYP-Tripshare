

import ChatMessage from "../models/ChatMessageModel.js";

// Store IO instance for use in other modules
let io = null;

export const setIO = (ioInstance) => {
  io = ioInstance;
  global.io = ioInstance;
};

export const getIO = () => {
  return io;
};

// Handle saving a message from socket to database
export const saveMessageFromSocket = async (messageData) => {
  try {
    // Validate required fields
    if (!messageData.rideId || !messageData.sender || !messageData.recipient || !messageData.content) {
      console.error("Missing required fields for chat message:", messageData);
      return null;
    }

    // Create new message document
    const newMessage = new ChatMessage({
      rideId: messageData.rideId,
      sender: messageData.sender,
      senderName: messageData.senderName || "User",
      recipient: messageData.recipient,
      content: messageData.content,
      status: "sent",
      timestamp: messageData.timestamp || new Date(),
    });

    // Save to database
    const savedMessage = await newMessage.save();
    console.log(`Message saved to database: ${savedMessage._id}`);
    return savedMessage;
  } catch (error) {
    console.error("Error saving socket message to database:", error);
    return null;
  }
};

// Update message status in database
export const updateMessageStatus = async (messageId, newStatus) => {
  try {
    const result = await ChatMessage.findByIdAndUpdate(
      messageId,
      { status: newStatus },
      { new: true }
    );
    
    return result;
  } catch (error) {
    console.error(`Error updating message ${messageId} status to ${newStatus}:`, error);
    return null;
  }
};

// Mark multiple messages as read
export const markMessagesAsRead = async (rideId, recipientId) => {
  try {
    const result = await ChatMessage.updateMany(
      { 
        rideId,
        recipient: recipientId,
        status: { $ne: "read" }
      },
      { status: "read" }
    );
    
    return result.modifiedCount || 0;
  } catch (error) {
    console.error(`Error marking messages as read for recipient ${recipientId}:`, error);
    return 0;
  }
};

// Get unread message count for a user
export const getUnreadMessageCount = async (userId) => {
  try {
    const count = await ChatMessage.countDocuments({
      recipient: userId,
      status: { $ne: "read" }
    });
    
    return count;
  } catch (error) {
    console.error(`Error getting unread message count for user ${userId}:`, error);
    return 0;
  }
};

// Broadcast unread message count to user
export const broadcastUnreadCount = async (userId) => {
  try {
    // Get current count
    const count = await getUnreadMessageCount(userId);
    
    // Find user's socket and emit
    if (io && global.onlineUsers && global.onlineUsers.has(userId)) {
      const socketId = global.onlineUsers.get(userId).socketId;
      io.to(socketId).emit("unread_messages_count", { count });
    }
    
    return count;
  } catch (error) {
    console.error(`Error broadcasting unread count to user ${userId}:`, error);
    return 0;
  }
};