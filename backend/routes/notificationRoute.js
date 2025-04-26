import express from "express";
import {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadCount,
} from "../controllers/notificationController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// CREATE
router.post("/create", protectRoute, createNotification);

// READ - get all notifications for the authenticated user
router.get("/getnotifications", protectRoute, getUserNotifications);

// Get unread count for the authenticated user
router.get("/unreadcount", protectRoute, getUnreadCount);

// MARK single as read
router.post("/read/:notificationId", protectRoute, markNotificationAsRead);

// MARK all as read
router.post("/markallread", protectRoute, markAllNotificationsAsRead);

// DELETE
router.delete("/delete/:notificationId", protectRoute, deleteNotification);

export default router;