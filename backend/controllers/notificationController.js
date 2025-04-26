import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
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
 * @route GET /api/notifications/notifications
 */
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, type, read } = req.query;

    // Build query
    const query = { recipientId: userId };

    // Add type filter if specified
    if (type) {
      query.type = type;
    }

    // Add read/unread filter if specified
    if (read === 'true') {
      query.isRead = true;
    } else if (read === 'false') {
      query.readBy = { $ne: userId }; // User not in readBy array means unread
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("senderId", "fullName userName profileImage");

    // Get total count for pagination
    const totalCount = await Notification.countDocuments(query);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    return res.status(200).json({
      success: true,
      count: notifications.length,
      pagination: {
        totalCount,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      },
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

/**
 * Get count of unread notifications for a specific user (internal function)
 * @param {string} userId - User ID to check
 * @returns {Promise<number>} Count of unread notifications
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    if (!userId) {
      return 0;
    }

    // Count notifications where user is the recipient and notification is unread
    const count = await Notification.countDocuments({
      recipientId: userId,
      readBy: { $ne: userId }, // User not in readBy array means unread
    });

    return count;
  } catch (error) {
    console.error(`Error counting unread notifications for user ${userId}:`, error);
    return 0;
  }
};

/**
 * Get recent unread notifications for a user (internal function)
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of notifications to return
 * @returns {Promise<Array>} Recent unread notifications
 */
export const getRecentUnreadNotifications = async (userId, limit = 10) => {
  try {
    if (!userId) {
      return [];
    }

    // Find recent unread notifications
    const notifications = await Notification.find({
      recipientId: userId,
      readBy: { $ne: userId }, // User not in readBy array means unread
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return notifications;
  } catch (error) {
    console.error(`Error fetching recent unread notifications for user ${userId}:`, error);
    return [];
  }
};

/**
 * Get all user IDs with role "user" (passengers)
 * @returns {Promise<Array<string>>} Array of user IDs
 */
export const getAllUserIds = async () => {
  try {
    // Find all users with role "user" and select only their IDs
    const users = await User.find({ role: "user" }, "_id").lean();

    // Extract IDs and convert to strings
    const userIds = users.map(user => user._id.toString());

    console.log(`Found ${userIds.length} users in the database`);
    return userIds;
  } catch (error) {
    console.error("Error fetching all user IDs:", error);
    return [];
  }
};

/**
 * Get IDs of all users (including users, drivers and admins)
 * @returns {Promise<Array<string>>} Array of user IDs
 */
export const getAllUserAndDriverIds = async () => {
  try {
    // Find all users and select only their IDs and roles
    const users = await User.find({}, "_id role").lean();

    // Extract IDs and convert to strings
    const userIds = users.map(user => user._id.toString());

    const userCount = users.filter(user => user.role === "user").length;
    const driverCount = users.filter(user => user.role === "driver").length;
    const adminCount = users.filter(user => user.role === "Admin").length;

    console.log(`Found ${userIds.length} total users: ${userCount} passengers, ${driverCount} drivers, ${adminCount} admins`);
    return userIds;
  } catch (error) {
    console.error("Error fetching all user IDs:", error);
    return [];
  }
};

/**
 * Create notifications for all users with a specific role
 * Used for mass notifications like new trips
 * @param {string} message - The notification message
 * @param {string} type - Notification type
 * @param {Object} data - Additional data
 * @param {string} role - User role to target (default: "user")
 * @param {string} excludeUserId - User ID to exclude from notifications
 * @returns {Promise<number>} Number of notifications created
 */
export const createNotificationsForUsersByRole = async (
  message,
  type,
  data = {},
  role = "user",
  excludeUserId = null
) => {
  try {
    if (!message || !type) {
      console.error("Message and type are required for mass notifications");
      return 0;
    }

    // Find all users with the specified role
    const query = { role };

    // Exclude the specified user if any
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    const users = await User.find(query).select("_id").lean();

    console.log(`Creating ${type} notifications for ${users.length} users with role ${role}`);

    // Create notifications in bulk
    const notificationsToCreate = users.map(user => ({
      recipientId: user._id,
      senderId: null, // System notification
      message,
      type,
      data,
      readBy: [],
      isRead: false,
      createdAt: new Date()
    }));

    // Use insertMany for better performance
    if (notificationsToCreate.length > 0) {
      const result = await Notification.insertMany(notificationsToCreate);

      // Emit socket events
      const io = getIO();
      if (io) {
        users.forEach(user => {
          io.to(user._id.toString()).emit("new_notification", {
            message,
            type,
            data,
            createdAt: new Date()
          });
        });
      }

      return result.length;
    }

    return 0;
  } catch (error) {
    console.error("Error creating mass notifications:", error);
    return 0;
  }
};

/**
 * Broadcast a message to all online users with a specific role
 * @param {string} event - Socket event name
 * @param {Object} data - Data to broadcast
 * @param {string} role - User role to target (default: "user")
 */
export const broadcastToRole = (event, data, role = "user") => {
  try {
    const io = getIO();
    if (!io) {
      console.warn("Socket.io not initialized, can't broadcast");
      return false;
    }

    console.log(`Broadcasting ${event} to all users with role ${role}`);
    io.to(`role:${role}`).emit(event, data);
    return true;
  } catch (error) {
    console.error(`Error broadcasting to role ${role}:`, error);
    return false;
  }
};

// Make the createSystemNotification function available globally
// This allows other controllers to create system notifications easily
global.createSystemNotification = createSystemNotification;