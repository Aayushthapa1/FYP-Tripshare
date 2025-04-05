import express from "express";
import {
    createNotification,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "../controllers/notificationController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// CREATE
router.post("/", protectRoute, createNotification);

// READ
router.get("/", protectRoute, getNotifications);

// MARK single as read
router.patch("/:notificationId/read", protectRoute, markNotificationAsRead);

// MARK all as read
router.patch("/mark-all-read", protectRoute, markAllNotificationsAsRead);

// DELETE
router.delete("/:notificationId", protectRoute, deleteNotification);

export default router;
