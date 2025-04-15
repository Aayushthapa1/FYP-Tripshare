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
router.post("/", protectRoute, createNotification);

// READ - get all notifications for the authenticated user
router.get("/notifications", protectRoute, getUserNotifications);

// Get unread count for the authenticated user
router.get("/unread-count", protectRoute, getUnreadCount);

// MARK single as read
router.patch("/:notificationId/read", protectRoute, markNotificationAsRead);

// MARK all as read
router.patch("/mark-all-read", protectRoute, markAllNotificationsAsRead);

// DELETE
router.delete("/:notificationId", protectRoute, deleteNotification);

export default router;