import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import { sendMessage, getMessages, markMessagesAsRead ,getUnreadCount,getConversations} from "../controllers/chatController.js";

const chatRoute = express.Router();

chatRoute.get("/conversations", protectRoute, getConversations);
chatRoute.get("/messages/:id", protectRoute, getMessages);
chatRoute.post("/sendMessage", protectRoute, sendMessage);
chatRoute.put("/markAsRead/:contactId", protectRoute, markMessagesAsRead);
chatRoute.get("/unread", protectRoute, getUnreadCount);

export default chatRoute;