import formatError from "../utils/errorUtils"
import axiosInstance from "../utils/axiosInstance"

// GET ALL CONVERSATIONS SERVICE
const getConversations = async () => {
    try {
        const response = await axiosInstance.get(`/api/chat/conversations`, {
            withCredentials: true,
        })
        return response.data
    } catch (error) {
        console.error("Error fetching conversations:", error)
        const formattedError = formatError(error)
        throw formattedError
    }
}

// GET MESSAGES BY CONTACT ID
const getMessages = async (contactId) => {
    try {
        const response = await axiosInstance.get(`/api/chat/messages/${contactId}`, {
            withCredentials: true,
        })
        return response.data
    } catch (error) {
        console.error("Error fetching messages:", error)
        const formattedError = formatError(error)
        throw formattedError
    }
}

// SEND MESSAGE
const sendMessage = async (messageData) => {
    try {
        // messageData should include { receiverId, content, messageType, receiverType } if needed
        const response = await axiosInstance.post(`/api/chat/sendMessage`, messageData, {
            withCredentials: true,
        })
        return response.data
    } catch (error) {
        console.error("Error sending message:", error)
        const formattedError = formatError(error)
        throw formattedError
    }
}

// MARK MESSAGES AS READ
const markMessagesAsRead = async (contactId) => {
    try {
        const response = await axiosInstance.put(`/api/chat/markAsRead/${contactId}`, {}, {
            withCredentials: true,
        })
        return response.data
    } catch (error) {
        console.error("Error marking messages as read:", error)
        const formattedError = formatError(error)
        throw formattedError
    }
}

// GET UNREAD MESSAGE COUNT
const getUnreadCount = async () => {
    try {
        const response = await axiosInstance.get(`/api/chat/unread`, {
            withCredentials: true,
        })
        return response.data
    } catch (error) {
        console.error("Error fetching unread count:", error)
        const formattedError = formatError(error)
        throw formattedError
    }
}

const chatService = {
    getConversations,
    getMessages,
    sendMessage,
    markMessagesAsRead,
    getUnreadCount,
}

export default chatService
