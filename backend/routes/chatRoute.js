import express from "express";
import {
  createChatRoom,
  getChatMessages,
} from "../controllers/chatController.js";

const router = express.Router();

// POST /chat-rooms
router.post("/chat-rooms", createChatRoom);

// GET /chat-rooms/:roomId/messages
router.get("/chat-rooms/:roomId/messages", getChatMessages);

export default router;
