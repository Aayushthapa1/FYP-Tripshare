// // Socket.IO utility for making the IO instance available throughout the app
// let ioInstance = null;

// /**
//  * Set the Socket.IO instance
//  * @param {Object} io - Socket.IO server instance
//  */
// export const setIO = (io) => {
//   ioInstance = io;

//   // Make IO available globally for modules that can't import
//   global.io = io;
// };

// /**
//  * Get the Socket.IO instance
//  * @returns {Object|null} Socket.IO server instance
//  */
// export const getIO = () => {
//   return ioInstance || global.io || null;
// };

// /**
//  * Send a notification to a specific user
//  * @param {string} userId - The user ID to send notification to
//  * @param {Object} notification - The notification object
//  * @returns {boolean} Success status
//  */
// export const sendNotification = (userId, notification) => {
//   const io = getIO();

//   if (!io || !userId || !notification) {
//     return false;
//   }

//   try {
//     io.to(userId).emit("notification", { notification });
//     return true;
//   } catch (error) {
//     console.error("Error sending notification:", error);
//     return false;
//   }
// };

// /**
//  * Broadcast a notification to all connected clients or specific role
//  * @param {Object} notification - The notification object
//  * @param {string} role - Optional role filter (driver, user, admin)
//  * @returns {boolean} Success status
//  */
// export const broadcastNotification = (notification, role = null) => {
//   const io = getIO();

//   if (!io || !notification) {
//     return false;
//   }

//   try {
//     if (role) {
//       // If we have global.onlineUsers, we can filter by role
//       if (global.onlineUsers) {
//         const targetsSocketIds = [];

//         global.onlineUsers.forEach((userData, userId) => {
//           if (userData.role === role) {
//             targetsSocketIds.push(userData.socketId);
//           }
//         });

//         // Emit to all targets
//         targetsSocketIds.forEach((socketId) => {
//           io.to(socketId).emit("notification", {
//             notification: {
//               ...notification,
//               forRole: role,
//             },
//           });
//         });
//       } else {
//         // Fallback to room-based roles if supported
//         io.to(`role:${role}`).emit("notification", {
//           notification: {
//             ...notification,
//             forRole: role,
//           },
//         });
//       }
//     } else {
//       // Broadcast to all
//       io.emit("notification", { notification });
//     }

//     return true;
//   } catch (error) {
//     console.error("Error broadcasting notification:", error);
//     return false;
//   }
// };

// export default {
//   setIO,
//   getIO,
//   sendNotification,
//   broadcastNotification,
// };


import ChatMessage from "../models/ChatMessage.js";

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