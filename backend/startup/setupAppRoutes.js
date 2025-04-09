// /startup/setupAppRoutes.js
import ChatMessage from "../models/chatModel.js";

const setupAppRoutes = (app) => {
  app.get("/chats/:chatRoomId/messages", async (req, res) => {
    try {
      const { chatRoomId } = req.params;
      const messages = await ChatMessage.find({ chatRoomId }).sort({
        createdAt: 1,
      });
      return res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Add more routes as needed
};

export default setupAppRoutes;
