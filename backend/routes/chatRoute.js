import express from "express";
import {
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
} from "../controllers/chatController.js";

const router = express.Router();


// Get messages for a specific ride
router.get("/ride/:rideId", getChatMessages);

// Send a new message
router.post("/send", sendChatMessage);

// Mark messages as read for a specific ride
router.put("/read/:rideId", markMessagesAsRead);

// Get unread message count for current user
router.get("/unread", getUnreadMessageCount);

export default router;
