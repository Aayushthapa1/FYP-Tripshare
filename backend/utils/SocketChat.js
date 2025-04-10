import ChatMessage from "../models/chatModel.js";
import UserModel from "../models/userModel.js";
import mongoose from "mongoose";

// Track active chat users
const activeChatUsers = new Map();

/**
 * Sets up chat-related socket event handlers
 * @param {Object} io - Socket.IO server instance
 */
export function setupChatHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`New socket connection: ${socket.id}`);
    
    // Handle user authentication and store their socket ID
    socket.on('authenticate', async ({ userId }, callback) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return callback({ success: false, error: 'Invalid user ID' });
        }
        
        const user = await UserModel.findById(userId);
        if (!user) {
          return callback({ success: false, error: 'User not found' });
        }
        
        // Store the user's socket ID
        activeChatUsers.set(userId, {
          socketId: socket.id,
          userId: userId,
          lastActive: new Date()
        });
        
        console.log(`User ${userId} connected with socket ${socket.id}`);
        callback({ success: true });
        
      } catch (error) {
        console.error('Authentication error:', error);
        callback({ success: false, error: 'Authentication failed' });
      }
    });
    
    // Handle incoming chat messages
    socket.on('sendChatMessage', async (messageData, callback) => {
      try {
        const { receiverId, content, messageType = 'text', receiverType } = messageData;
        
        if (!receiverId || !content) {
          return callback({ success: false, error: 'Receiver ID and content are required' });
        }
        
        // Validate receiver exists
        const receiver = await UserModel.findById(receiverId);
        if (!receiver) {
          return callback({ success: false, error: 'Receiver not found' });
        }
        
        // Get sender info from socket (you might want to enhance this with proper auth)
        const senderInfo = Array.from(activeChatUsers.entries())
          .find(([_, info]) => info.socketId === socket.id);
        
        if (!senderInfo) {
          return callback({ success: false, error: 'Sender not authenticated' });
        }
        
        const senderId = senderInfo[0];
        const sender = await UserModel.findById(senderId);
        if (!sender) {
          return callback({ success: false, error: 'Sender not found' });
        }
        
        // Create and save the message
        const newMessage = new ChatMessage({
          sender: senderId,
          senderType: sender.role === 'driver' ? 'Driver' : 'User',
          receiver: receiverId,
          receiverType: receiverType || (receiver.role === 'driver' ? 'Driver' : 'User'),
          messageType,
          content,
          read: false
        });
        
        const savedMessage = await newMessage.save();
        
        // Prepare the message data to send to receiver
        const messageToSend = {
          _id: savedMessage._id,
          sender: senderId,
          content: savedMessage.content,
          createdAt: savedMessage.createdAt,
          messageType: savedMessage.messageType,
          read: savedMessage.read
        };
        
        // Check if receiver is online and send the message
        const receiverSocket = activeChatUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('newChatMessage', messageToSend);
        }
        
        // Also send the message back to sender for their own UI
        socket.emit('newChatMessage', messageToSend);
        
        callback({ 
          success: true, 
          message: messageToSend 
        });
        
      } catch (error) {
        console.error('Error handling chat message:', error);
        callback({ success: false, error: 'Failed to send message' });
      }
    });
    
    // Handle message read receipts
    socket.on('markMessagesAsRead', async ({ senderId }, callback) => {
      try {
        const receiverInfo = Array.from(activeChatUsers.entries())
          .find(([_, info]) => info.socketId === socket.id);
        
        if (!receiverInfo) {
          return callback({ success: false, error: 'Not authenticated' });
        }
        
        const receiverId = receiverInfo[0];
        
        // Update messages in database
        await ChatMessage.updateMany(
          {
            sender: senderId,
            receiver: receiverId,
            read: false
          },
          { $set: { read: true } }
        );
        
        // Notify the sender that their messages were read
        const senderSocket = activeChatUsers.get(senderId);
        if (senderSocket) {
          io.to(senderSocket.socketId).emit('messagesRead', { receiverId });
        }
        
        callback({ success: true });
        
      } catch (error) {
        console.error('Error marking messages as read:', error);
        callback({ success: false, error: 'Failed to mark messages as read' });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      // Remove user from active users map
      for (const [userId, info] of activeChatUsers.entries()) {
        if (info.socketId === socket.id) {
          activeChatUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });
}
