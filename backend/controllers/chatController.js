import Message from "../models/chatModel.js";
import UserModel from "../models/userModel.js";
import { createResponse } from "../utils/responseHelper.js";
import mongoose from "mongoose";
import { activeChatUsers } from '../utils/setupSocketServer.js';
import { io } from '../server.js';

/**
 * Send a message from one user to another
 * @route POST /api/chat/sendMessage
 * @access Private
 */

// Send message (backup REST API method)
export const sendMessage = async (req, res) => {
    try {
      const { receiverId, content, messageType = "text", receiverType } = req.body;
      
      if (!receiverId || !content) {
        return res.status(400).json(
          createResponse(400, false, [
            { message: "Receiver ID and message content are required" }
          ])
        );
      }
  
      if (!mongoose.Types.ObjectId.isValid(receiverId)) {
        return res.status(400).json(
          createResponse(400, false, [
            { message: "Invalid receiver ID format" }
          ])
        );
      }
  
      // Verify that the receiver exists
      const receiver = await UserModel.findById(receiverId);
  
      if (!receiver) {
        return res.status(404).json(
          createResponse(404, false, [
            { message: "Receiver not found" }
          ])
        );
      }
  
      // Determine sender and receiver types
      const senderType = req.user.role === "driver" ? "Driver" : "User";
      const actualReceiverType = receiverType || (receiver.role === "driver" ? "Driver" : "User");
  
      // Create and save the new message
      const newMessage = new Message({
        sender: req.user._id,
        senderType,
        receiver: receiverId,
        receiverType: actualReceiverType,
        messageType,
        content,
        read: false
      });
  
      const savedMessage = await newMessage.save();
  
      // Attempt to send the message in real-time if receiver is online
      const receiverSocketId = activeChatUsers.get(receiverId)?.socketId;
      if (receiverSocketId && req.io) {
        req.io.to(receiverSocketId).emit("newChatMessage", {
          messageId: savedMessage._id,
          senderId: req.user._id,
          senderName: req.user.fullName || req.user.name || req.user.userName,
          content,
          createdAt: savedMessage.createdAt,
          messageType
        });
      }
  
      return res.status(201).json(
        createResponse(201, true, [
          { message: "Message sent successfully" }
        ], savedMessage)
      );
    } catch (error) {
      console.error("Error in sendMessage:", error);
      return res.status(500).json(
        createResponse(500, false, [
          { message: "Failed to send message. Please try again later." }
        ])
      );
    }
  };

/**
 * Get conversation history between current user and specified user
 * @route GET /api/chat/messages/:id
 * @access Private
 */
export const getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.id;
    const currentUserId = req.user._id;
    
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json(
        createResponse(400, false, [
          { message: "Invalid user ID format" }
        ])
      );
    }

    // Get the other user to determine their type
    const otherUser = await UserModel.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json(
        createResponse(404, false, [
          { message: "User not found" }
        ])
      );
    }

    // Determine the user types based on roles
    const otherUserType = otherUser.role === "driver" ? "Driver" : "User";
    const currentUserType = req.user.role === "driver" ? "Driver" : "User";

    // Find messages where either:
    // 1. Current user is sender and other user is receiver
    // 2. Other user is sender and current user is receiver
    const messages = await Message.find({
      $or: [
        {
          sender: currentUserId,
          senderType: currentUserType,
          receiver: otherUserId,
          receiverType: otherUserType
        },
        {
          sender: otherUserId,
          senderType: otherUserType,
          receiver: currentUserId,
          receiverType: currentUserType
        }
      ]
    }).sort({ createdAt: 1 }); 

    return res.status(200).json(
      createResponse(200, true, [], {
        messages,
        count: messages.length
      })
    );
  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json(
      createResponse(500, false, [
        { message: "Failed to retrieve messages. Please try again later." }
      ])
    );
  }
};

/**
 * Get all conversations for the current user
 * @route GET /api/chat/conversations
 * @access Private
 */
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUserType = req.user.role === "driver" ? "Driver" : "User";

    // Aggregate to find unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(currentUserId), senderType: currentUserType },
            { receiver: new mongoose.Types.ObjectId(currentUserId), receiverType: currentUserType }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(currentUserId)] },
              "$receiver",
              "$sender"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          lastMessageDate: { $first: "$createdAt" }
        }
      },
      {
        $sort: { lastMessageDate: -1 }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $addFields: {
          contactDetails: { $arrayElemAt: ["$userDetails", 0] }
        }
      },
      {
        $project: {
          _id: 0,
          contactId: "$_id",
          contactName: "$contactDetails.fullName",
          contactUsername: "$contactDetails.userName",
          contactRole: "$contactDetails.role",
          lastMessage: "$lastMessage.content",
          lastMessageDate: "$lastMessageDate",
          unreadCount: { $cond: [{ $eq: ["$lastMessage.read", false] }, 1, 0] }
        }
      }
    ]);

    return res.status(200).json(
      createResponse(200, true, [], {
        conversations,
        count: conversations.length
      })
    );
  } catch (error) {
    console.error("Error in getConversations:", error);
    return res.status(500).json(
      createResponse(500, false, [
        { message: "Failed to retrieve conversations. Please try again later." }
      ])
    );
  }
};

/**
 * Mark messages as read
 * @route PUT /api/chat/markAsRead/:contactId
 * @access Private
 */
export const markMessagesAsRead = async (req, res) => {
  try {
    const { contactId } = req.params;
    const currentUserId = req.user._id;
    
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      return res.status(400).json(
        createResponse(400, false, [
          { message: "Invalid contact ID format" }
        ])
      );
    }
    
    // Get the contact to determine their type
    const contact = await UserModel.findById(contactId);
    if (!contact) {
      return res.status(404).json(
        createResponse(404, false, [
          { message: "Contact not found" }
        ])
      );
    }
    
    const contactType = contact.role === "driver" ? "Driver" : "User";
    const currentUserType = req.user.role === "driver" ? "Driver" : "User";

    // Update all unread messages from this contact to the current user
    const result = await Message.updateMany(
      {
        sender: contactId,
        senderType: contactType,
        receiver: currentUserId,
        receiverType: currentUserType,
        read: false
      },
      {
        $set: { read: true }
      }
    );

    return res.status(200).json(
      createResponse(200, true, [
        { message: `${result.modifiedCount} messages marked as read` }
      ])
    );
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error);
    return res.status(500).json(
      createResponse(500, false, [
        { message: "Failed to mark messages as read. Please try again later." }
      ])
    );
  }
};

/**
 * Get unread message count
 * @route GET /api/chat/unread
 * @access Private
 */
export const getUnreadCount = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUserType = req.user.role === "driver" ? "Driver" : "User";
    
    const count = await Message.countDocuments({
      receiver: currentUserId,
      receiverType: currentUserType,
      read: false
    });
    
    return res.status(200).json(
      createResponse(200, true, [], { unreadCount: count })
    );
  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    return res.status(500).json(
      createResponse(500, false, [
        { message: "Failed to get unread message count. Please try again later." }
      ])
    );
  }
};

export default { sendMessage, getMessages, markMessagesAsRead, getConversations, getUnreadCount };