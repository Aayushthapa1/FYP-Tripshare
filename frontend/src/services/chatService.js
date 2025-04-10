import axios from "axios";
import { Base_Backend_Url } from "../../constant";
import formatError from "../utils/errorUtils";
import axiosInstance from "../utils/axiosInstance";

// GET TRIP MESSAGES
const getTripMessages = async (tripId, page = 1, limit = 50) => {
    try {
        const response = await axiosInstance.get(
            `/api/chats/${tripId}?page=${page}&limit=${limit}`
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching trip messages:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// SEND TEXT MESSAGE
const sendTextMessage = async (tripId, content) => {
    try {
        const response = await axiosInstance.post(`/api/chats/text`, {
            tripId,
            content,
        });
        return response.data;
    } catch (error) {
        console.error("Error sending text message:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// SEND IMAGE MESSAGE
const sendImageMessage = async (tripId, imageFile) => {
    try {
        const formData = new FormData();
        formData.append("tripId", tripId);
        formData.append("image", imageFile);

        const response = await axiosInstance.post(`/api/chats/image`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error sending image message:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// SEND FILE MESSAGE
const sendFileMessage = async (tripId, file) => {
    try {
        const formData = new FormData();
        formData.append("tripId", tripId);
        formData.append("file", file);

        const response = await axiosInstance.post(`/api/chats/file`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error sending file message:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// DELETE MESSAGE
const deleteMessage = async (messageId) => {
    try {
        const response = await axiosInstance.delete(`/api/chats/${messageId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting message:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// GET UNREAD COUNT
const getUnreadCount = async () => {
    try {
        const response = await axiosInstance.get(`/api/chats/unread/count`);
        return response.data;
    } catch (error) {
        console.error("Error fetching unread count:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// GET MESSAGE BY ID
const getMessageById = async (messageId) => {
    try {
        const response = await axiosInstance.get(`/api/chats/message/${messageId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching message:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// MARK MESSAGES AS READ
const markMessagesAsRead = async (tripId, messageIds) => {
    try {
        const response = await axiosInstance.post(`/api/chats/read`, {
            tripId,
            messageIds,
        });
        return response.data;
    } catch (error) {
        console.error("Error marking messages as read:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// GET CHAT STATISTICS
const getChatStatistics = async (tripId) => {
    try {
        const response = await axiosInstance.get(`/api/chats/statistics/${tripId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching chat statistics:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// SET TYPING STATUS
const setTypingStatus = async (tripId, isTyping) => {
    try {
        const response = await axiosInstance.post(`/api/chats/typing`, {
            tripId,
            isTyping,
        });
        return response.data;
    } catch (error) {
        console.error("Error setting typing status:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// SEARCH MESSAGES
const searchMessages = async (tripId, query, page = 1, limit = 20) => {
    try {
        const response = await axiosInstance.get(
            `/api/chats/search/${tripId}?query=${encodeURIComponent(
                query
            )}&page=${page}&limit=${limit}`
        );
        return response.data;
    } catch (error) {
        console.error("Error searching messages:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

const chatService = {
    getTripMessages,
    sendTextMessage,
    sendImageMessage,
    sendFileMessage,
    deleteMessage,
    getUnreadCount,
    getMessageById,
    markMessagesAsRead,
    getChatStatistics,
    setTypingStatus,
    searchMessages,
};

export default chatService;