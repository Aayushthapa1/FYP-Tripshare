"use client";

import { useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bell, Check, Trash2, Car } from "lucide-react";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  addNotification, // so we can dispatch new notifications
} from "../Slices/notificationSlice";
import socketService from "./socketService";

const NotificationDropdown = ({
  onClose,
  localNotifications = [],
  clearLocalNotifications,
}) => {
  const dispatch = useDispatch();
  const { notifications, isLoading } = useSelector(
    (state) => state.notification
  );
  const { user } = useSelector((state) => state.auth) || {};
  const dropdownRef = useRef(null);
  const isInitialMount = useRef(true);

  // Combine Redux notifications with local notifications
  const allNotifications = [
    ...notifications,
    ...localNotifications.map((local) => ({
      _id: local.id,
      message: local.message,
      type: local.type,
      createdAt: local.timestamp,
      readBy: [],
    })),
  ];

  // Memoize the fetch function
  const fetchNotificationsMemoized = useCallback(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // 1) Connect to Socket.IO once on mount, and listen for new notifications
  useEffect(() => {
    if (!user) return; // If not logged in, skip

    // Connect with userId in query
    const socket = socketService.connect({ userId: user._id });

    // Listen for "notification_created" (or any relevant event name from your server)
    const handleNewNotification = (notif) => {
      // "notif" could have shape { _id, message, type, createdAt, readBy, etc. }
      console.log("Received new notification via Socket.IO:", notif);
      dispatch(addNotification(notif));
    };

    socket.on("notification_created", handleNewNotification);

    return () => {
      socket.off("notification_created", handleNewNotification);
      socketService.disconnect();
    };
  }, [user, dispatch]);

  // 2) On mount, fetch notifications from the server
  useEffect(() => {
    if (isInitialMount.current && user) {
      fetchNotificationsMemoized();
      isInitialMount.current = false;
    }

    // Close dropdown if clicking outside it
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [fetchNotificationsMemoized, onClose, user]);

  // 3) Mark single notification as read
  const handleMarkAsRead = (notificationId) => {
    if (notifications.some((n) => n._id === notificationId)) {
      dispatch(markNotificationAsRead(notificationId));
    } else {
      console.log("Local notification marked as read:", notificationId);
    }
  };

  // 4) Mark all notifications as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    if (localNotifications.length > 0 && clearLocalNotifications) {
      clearLocalNotifications();
    }
  };

  // 5) Delete notification
  const handleDelete = (notificationId) => {
    if (notifications.some((n) => n._id === notificationId)) {
      dispatch(deleteNotification(notificationId));
    } else if (clearLocalNotifications) {
      const updatedLocalNotifications = localNotifications.filter(
        (n) => n.id !== notificationId
      );
      clearLocalNotifications(updatedLocalNotifications);
    }
  };

  // Format the timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case "trip":
        return <Car className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  // Count unread
  const unreadCount = allNotifications.filter(
    (notif) => !notif.readBy || !notif.readBy.includes(user?._id)
  ).length;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl py-2 border border-gray-100 z-50"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-gray-700 mr-2" />
            <p className="text-sm font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </p>
          </div>
          {allNotifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-gray-500 hover:text-green-600"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading && notifications.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-green-500 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">
              Loading notifications...
            </p>
          </div>
        ) : allNotifications.length > 0 ? (
          allNotifications.map((notif) => {
            const isRead = notif.readBy && notif.readBy.includes(user?._id);
            return (
              <div
                key={notif._id}
                className={`px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                  !isRead ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <p
                      className={`text-sm ${
                        !isRead ? "font-medium" : "text-gray-700"
                      }`}
                    >
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(notif.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    {!isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="p-1 text-gray-400 hover:text-green-600 rounded-full hover:bg-gray-100"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif._id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {allNotifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <button
            onClick={() => {
              onClose();
            }}
            className="text-xs text-green-600 hover:text-green-700 w-full text-center"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
