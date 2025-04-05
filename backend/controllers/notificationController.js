
import Notification from "../models/notificationModel.js";
import { io } from "../server.js";  // Where Socket.IO is set up

/**
 * CREATE a new notification
 * Recommended to broadcast "notification_created" event.
 */
export const createNotification = async (req, res, next) => {
    try {
        const { message, type, audience, userIds } = req.body;

        const newNotification = await Notification.create({
            message,
            type,
            audience,
            userIds,
        });

        // Real-time broadcast (simple: everyone gets it).
        // If you only want certain users to get it, use a user→socket map or rooms.
        if (io) {
            io.emit("notification_created", {
                notificationId: newNotification._id,
                message: newNotification.message,
                type: newNotification.type,
                audience: newNotification.audience,
                userIds: newNotification.userIds,
                createdAt: newNotification.createdAt,
            });
        }

        return res.status(201).json({
            success: true,
            data: newNotification,
        });
    } catch (error) {
        console.error("Error creating notification:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

/**
 * GET notifications for the current user based on role or userId
 * This does NOT emit real-time events; it's just a fetch.
 */
export const getNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        // Matches audience=all, audience=userRole, or userIds includes userId
        const query = {
            $or: [
                { audience: "all" },
                { audience: userRole },
                { userIds: userId },
            ],
        };

        // Example: limit to 50, most recent first
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

/**
 * OPTIONAL: GET only unread notifications
 * (All notifications minus those in which userId is in readBy)
 */
export const getUnreadNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        // same audience logic
        const query = {
            $or: [
                { audience: "all" },
                { audience: userRole },
                { userIds: userId },
            ],
            readBy: { $ne: userId }, // user not in readBy
        };

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error("Error fetching unread notifications:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

/**
 * MARK a specific notification as read by current user
 * Then broadcast "notification_marked_as_read".
 */
export const markNotificationAsRead = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { notificationId } = req.params;

        // Add userId to the readBy array only once
        const updatedNotif = await Notification.findByIdAndUpdate(
            notificationId,
            { $addToSet: { readBy: userId } },
            { new: true }
        );

        if (!updatedNotif) {
            return res.status(404).json({ success: false, error: "Not found" });
        }

        // Broadcast real-time update
        if (io) {
            io.emit("notification_marked_as_read", {
                notificationId,
                userId,
            });
        }

        return res.status(200).json({ success: true, data: updatedNotif });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

/**
 * OPTIONAL: Mark multiple notifications as read in one request
 */
export const markMultipleNotificationsAsRead = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { notificationIds } = req.body; // array of IDs

        if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
            return res
                .status(400)
                .json({ success: false, error: "No notification IDs provided" });
        }

        await Notification.updateMany(
            { _id: { $in: notificationIds } },
            { $addToSet: { readBy: userId } }
        );

        // If you want to broadcast a single event or multiple for each ID, your choice
        if (io) {
            io.emit("notifications_marked_multiple", {
                notificationIds,
                userId,
            });
        }

        return res
            .status(200)
            .json({ success: true, message: "Notifications marked as read" });
    } catch (error) {
        console.error("Error marking multiple notifications as read:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

/**
 * MARK ALL relevant notifications as read for current user
 */
export const markAllNotificationsAsRead = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        // Match the audience logic
        const query = {
            $or: [
                { audience: "all" },
                { audience: userRole },
                { userIds: userId },
            ],
        };

        await Notification.updateMany(query, { $addToSet: { readBy: userId } });

        // Real-time broadcast
        if (io) {
            io.emit("notifications_marked_all_as_read", {
                userId,
                message: "All notifications were marked as read",
            });
        }

        return res
            .status(200)
            .json({ success: true, message: "All marked as read" });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};

/**
 * DELETE a notification
 * Then broadcast "notification_deleted".
 */
export const deleteNotification = async (req, res, next) => {
    try {
        const { notificationId } = req.params;

        const deletedNotif = await Notification.findByIdAndDelete(notificationId);

        if (!deletedNotif) {
            return res.status(404).json({ success: false, error: "Not found" });
        }

        // Real-time broadcast of deletion
        if (io) {
            io.emit("notification_deleted", {
                notificationId,
                message: "A notification was deleted",
            });
        }

        return res.status(200).json({
            success: true,
            data: deletedNotif,
            message: "Notification deleted",
        });
    } catch (error) {
        console.error("Error deleting notification:", error);
        return res.status(500).json({ success: false, error: "Server error" });
    }
};
