import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  Car,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  User,
  X,
} from "lucide-react";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} from "../../Slices/notificationSlice";
import { toast } from "sonner";

const AdminNotificationDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Get data from Redux store
  const { notifications, unreadCount, loading } = useSelector(
    (state) => state.notification
  );
  const { isSocketConnected, activeUsers } = useSelector(
    (state) =>
      state.notification || {
        isSocketConnected: false,
        activeUsers: { total: 0, driver: 0, user: 0 },
      }
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch notifications on initial render
  useEffect(() => {
    dispatch(fetchNotifications());
    dispatch(getUnreadCount());

    // Refresh notifications every 60 seconds
    const interval = setInterval(() => {
      if (!showDropdown) {
        // Only auto-refresh when dropdown is closed
        dispatch(getUnreadCount());
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch, showDropdown]);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);

    // Fetch latest notifications when opening dropdown
    if (!showDropdown) {
      dispatch(fetchNotifications());
    }
  };

  // Handle marking a notification as read
  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    dispatch(markNotificationAsRead(id))
      .unwrap()
      .then(() => {
        // Success handled by Redux
      })
      .catch((error) => {
        toast.error(`Failed to mark notification as read: ${error}`);
      });
  };

  // Handle marking all notifications as read
  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;

    dispatch(markAllAsRead())
      .unwrap()
      .then(() => {
        toast.success("All notifications marked as read");
      })
      .catch((error) => {
        toast.error(`Failed to mark all as read: ${error}`);
      });
  };

  // Handle deleting a notification
  const handleDeleteNotification = (id, e) => {
    e.stopPropagation();

    dispatch(deleteNotification(id))
      .unwrap()
      .then(() => {
        toast.success("Notification removed");
      })
      .catch((error) => {
        toast.error(`Failed to delete notification: ${error}`);
      });
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification._id));
    }

    // Navigate based on notification type
    if (notification.type === "ride_request" && notification.data?.rideId) {
      navigate(`/admin/rides/${notification.data.rideId}`);
    } else if (
      notification.type === "driver_update" &&
      notification.data?.driverId
    ) {
      navigate(`/admin/drivers/${notification.data.driverId}`);
    } else if (
      notification.type === "user_registration" &&
      notification.data?.userId
    ) {
      navigate(`/admin/users/${notification.data.userId}`);
    } else if (
      notification.type === "payment" &&
      notification.data?.paymentId
    ) {
      navigate(`/admin/payments/${notification.data.paymentId}`);
    } else {
      // Default to notifications page
      navigate(`/admin/notifications`);
    }

    // Close dropdown
    setShowDropdown(false);
  };

  // Format notification time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) {
      return "Just now";
    } else if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHour < 24) {
      return `${diffHour}h ago`;
    } else if (diffDay < 7) {
      return `${diffDay}d ago`;
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (notification) => {
    const type = notification.type || "";
    const status = notification.data?.status || "";

    if (type.includes("ride")) {
      if (status === "completed") {
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      } else if (status === "canceled") {
        return <XCircle className="h-5 w-5 text-red-500" />;
      } else if (status === "in_progress") {
        return <MapPin className="h-5 w-5 text-purple-500" />;
      } else {
        return <Car className="h-5 w-5 text-blue-500" />;
      }
    } else if (type.includes("driver")) {
      return <User className="h-5 w-5 text-orange-500" />;
    } else if (type.includes("payment")) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (type.includes("error") || type.includes("warning")) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />

        {/* Connection Status Indicator */}
        <span
          className={`absolute top-1 right-1 h-2 w-2 rounded-full ${
            isSocketConnected ? "bg-green-500" : "bg-red-500"
          }`}
        ></span>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showDropdown && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700 z-30">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <div className="flex space-x-2">
              <span className="text-xs text-gray-500 flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                {activeUsers?.total || 0} online
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Optional: Online Users Stats */}
          {activeUsers && (activeUsers.driver > 0 || activeUsers.user > 0) && (
            <div className="flex justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
              <span className="flex items-center">
                <Car className="h-3.5 w-3.5 mr-1 text-blue-500" />
                {activeUsers.driver || 0} Drivers
              </span>
              <span className="flex items-center">
                <User className="h-3.5 w-3.5 mr-1 text-purple-500" />
                {activeUsers.user || 0} Passengers
              </span>
            </div>
          )}

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading notifications...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No notifications
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer ${
                      !notification.isRead
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium text-gray-800 dark:text-gray-200 ${
                              !notification.isRead ? "font-semibold" : ""
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {!notification.isRead && (
                          <button
                            onClick={(e) =>
                              handleMarkAsRead(notification._id, e)
                            }
                            className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) =>
                            handleDeleteNotification(notification._id, e)
                          }
                          className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                          title="Remove notification"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="py-2 px-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <Link
              to="/admin/notifications"
              className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium"
              onClick={() => setShowDropdown(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationDropdown;
