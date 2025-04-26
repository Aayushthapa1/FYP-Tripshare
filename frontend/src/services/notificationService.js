import axiosInstance from "../utils/axiosInstance";
import formatError from "../utils/errorUtils";

/**
 * Get all notifications for the authenticated user
 * GET /api/notifications
 */
const getNotifications = async () => {
    try {
        const response = await axiosInstance.get("/api/notifications/getnotifications", {
            withCredentials: true,
        });
        return response.data; // e.g. { success: true, data: [...] }
    } catch (error) {
        throw formatError(error);
    }
};

/**
 * CREATE a notification
 * POST /api/notifications/create
 */
const createNotification = async (notificationData) => {
    try {
        const response = await axiosInstance.post(
            "/api/notifications/create",
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
 * PATCH /api/notifications/read/:notificationId
 */
const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await axiosInstance.post(
            `/api/notifications/read/${notificationId}`,
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
 * PATCH /api/notifications/markallread
 */
const markAllNotificationsAsRead = async () => {
    try {
        const response = await axiosInstance.post(
            "/api/notifications/markallread",
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
 * DELETE /api/notifications/delete/:notificationId
 */
const deleteNotification = async (notificationId) => {
    try {
        const response = await axiosInstance.delete(
            `/api/notifications/delete/${notificationId}`,
            { withCredentials: true }
        );
        return response.data; // { success: true, data: deletedDoc, notificationId }
    } catch (error) {
        throw formatError(error);
    }
};

/**
 * GET unread notification count
 * GET /api/notifications/unreadcount
 */
const getUnreadCount = async () => {
    try {
        const response = await axiosInstance.get(
            "/api/notifications/unreadcount",
            { withCredentials: true }
        );
        return response.data; // { success: true, count: 5 }
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
    getUnreadCount,
};

export default notificationService;