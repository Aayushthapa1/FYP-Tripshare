import axios from "axios";
import { Base_Backend_Url } from "../../constant";
import formatError from "../utils/errorUtils";
import axiosInstance from "../utils/axiosInstance"; // if you prefer your custom instance

/**
 * GET user’s notifications
 */
const getNotifications = async () => {
    try {
        const response = await axios.get(`${Base_Backend_Url}/api/notifications`, {
            withCredentials: true,
        });
        return response.data; // e.g. { success: true, data: [...] }
    } catch (error) {
        throw formatError(error);
    }
};

/**
 * CREATE a notification
 */
const createNotification = async (notificationData) => {
    try {
        const response = await axios.post(
            `${Base_Backend_Url}/api/notifications`,
            notificationData,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        throw formatError(error);
    }
};

/**
 * MARK one notification as read
 */
const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await axios.patch(
            `${Base_Backend_Url}/api/notifications/${notificationId}/read`,
            {},
            { withCredentials: true }
        );
        return response.data; // { success: true, data: updatedNotification }
    } catch (error) {
        throw formatError(error);
    }
};

/**
 * MARK all notifications as read
 */
const markAllNotificationsAsRead = async () => {
    try {
        const response = await axios.patch(
            `${Base_Backend_Url}/api/notifications/mark-all-read`,
            {},
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        throw formatError(error);
    }
};

/**
 * DELETE a notification
 */
const deleteNotification = async (notificationId) => {
    try {
        const response = await axios.delete(
            `${Base_Backend_Url}/api/notifications/${notificationId}`,
            { withCredentials: true }
        );
        return response.data; // { success: true, data: deletedDoc }
    } catch (error) {
        throw formatError(error);
    }
};

const notificationService = {
    getNotifications,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};

export default notificationService;
