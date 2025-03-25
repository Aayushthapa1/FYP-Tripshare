import ChatRoom from "../models/chatRoomModel.js";
import ChatMessage from "../models/chatMessageModel.js";

// Create a new chat room
// Body: { participants: ["userA", "userB", ...] }
export const createChatRoom = async (req, res) => {
    try {
        const { participants } = req.body;
        if (!participants || !Array.isArray(participants)) {
            return res.status(400).json({ error: "participants must be an array" });
        }
        const newRoom = await ChatRoom.create({ participants });
        return res.status(201).json(newRoom);
    } catch (error) {
        console.error("createChatRoom error:", error);
        return res.status(500).json({ error: error.message });
    }
};

// Get messages for a specific chat room
// Query param: roomId
export const getChatMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await ChatMessage
            .find({ chatRoomId: roomId })
            .sort({ createdAt: 1 });
        return res.json(messages);
    } catch (error) {
        console.error("getChatMessages error:", error);
        return res.status(500).json({ error: error.message });
    }
};


// Add a new message to a specific chat room
// Body: { chatRoomId, senderId, message }
export const addMessage = async (req, res) => {
    try {
        const { chatRoomId, senderId, message } = req.body;
        const newMessage = await ChatMessage.create({ chatRoomId, senderId, message });
        return res.status(201).json(newMessage);
    } catch (error) {
        console.error("addMessage error:", error);
        return res.status(500).json({ error: error.message });
    }
};



