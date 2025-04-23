import Notification from "../models/notificationModel.js";
import mongoose from "mongoose";
import { getIO } from "../utils/SocketUtils.js";

/**
 * Create a new notification
 * @route POST /api/notifications
 */
export const createNotification = async (req, res) => {
  try {
    const { recipientId, message, type, data = {} } = req.body;
    const io = getIO();

    // Validate required fields
    if (!recipientId || !message) {
      return res.status(400).json({
        success: false,
        message: "Recipient ID and message are required",
      });
    }

    // Create notification
    const notification = await Notification.create({
      recipientId,
      senderId: req.user._id, // Use _id consistently instead of id
      message,
      type: type || "general",
      data,
    });

    // Emit socket event if socket server is available
    if (io) {
      io.to(recipientId.toString()).emit("new_notification", {
        _id: notification._id,
        message: notification.message,
        type: notification.type,
        createdAt: notification.createdAt,
        data: notification.data,
        readBy: notification.readBy,
        isRead: notification.isRead,
      });
    }

    return res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: error.message,
    });
  }
};

/**
 * Create a system notification (used by other controllers without auth)
 * For internal use only - not exposed as API endpoint
 */
export const createSystemNotification = async (
  recipientId,
  message,
  type,
  data = {}
) => {
  try {
    const io = getIO();

    if (!recipientId || !message) {
      console.error(
        "System notification error: Recipient ID and message are required"
      );
      return null;
    }

    // Create notification with system as sender
    const notification = await Notification.create({
      recipientId,
      senderId: null, // null means system notification
      message,
      type: type || "system",
      data,
    });

    // Emit socket event if socket server is available
    if (io) {
      io.to(recipientId.toString()).emit("new_notification", {
        _id: notification._id,
        message: notification.message,
        type: notification.type,
        createdAt: notification.createdAt,
        data: notification.data,
        readBy: notification.readBy,
        isRead: notification.isRead,
      });
    }

    return notification;
  } catch (error) {
    console.error("System notification error:", error);
    return null;
  }
};

/**
 * Get all notifications for a user
 * @route GET /api/notifications
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({
      recipientId: userId,
    })
      .sort({ createdAt: -1 })
      .populate("senderId", "fullName username profileImage");

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

/**
 * Mark a notification as read
 * @route PATCH /api/notifications/:notificationId/read
 */
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id; // Use _id consistently

    // Validate notification ID
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if this notification belongs to the user
    if (notification.recipientId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this notification",
      });
    }

    // Add user to readBy array if not already there
    if (!notification.readBy.includes(userId)) {
      notification.readBy.push(userId);
      notification.isRead = true;
      await notification.save();
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read
 * @route PATCH /api/notifications/mark-all-read
 */
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id; // Use _id consistently

    // Update all unread notifications for this user
    const result = await Notification.updateMany(
      {
        recipientId: userId,
        readBy: { $ne: userId }, // Only if user is not already in readBy
      },
      {
        $addToSet: { readBy: userId },
        isRead: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      count: result.modifiedCount,
      userId,
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

/**
 * Delete a notification
 * @route DELETE /api/notifications/:notificationId
 */
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id; // Use _id consistently

    // Validate notification ID
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Check if this notification belongs to the user
    if (notification.recipientId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this notification",
      });
    }

    await notification.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      notificationId,
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

/**
 * Get unread notification count
 * @route GET /api/notifications/unread-count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Notification.countDocuments({
      recipientId: userId,
      readBy: { $ne: userId }, // User not in readBy array means unread
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get unread notification count",
      error: error.message,
    });
  }
};