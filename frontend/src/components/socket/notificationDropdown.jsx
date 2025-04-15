import React, { useRef, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  Check,
  Trash2,
  Car,
  MapPin,
  CheckCircle,
  X,
  Clock,
  Navigation,
  DollarSign,
  AlertTriangle,
  XCircle,
  PhoneCall,
  MessageSquare,
  User,
  Search,
} from "lucide-react";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  addNotification,
} from "../Slices/notificationSlice";
import { useNavigate } from "react-router-dom";
import socketService from "../socket/socketService";
import { toast } from "sonner";

/**
 * NotificationCenter component
 * Displays and manages all notifications for the user
 */
const NotificationCenter = ({
  onClose,
  localNotifications = [],
  clearLocalNotifications,
  clearSingleNotification,
  isOpen,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const {
    notifications = [],
    loading: isLoading,
    error,
  } = useSelector((state) => state.notification || { notifications: [] });
  const { user } = useSelector((state) => state.auth) || {};

  // Refs
  const dropdownRef = useRef(null);

  // Local state
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  // Check socket connection status
  useEffect(() => {
    const checkSocketConnection = () => {
      const isConnected = socketService?.socket?.connected || false;
      setSocketConnected(isConnected);

      if (!isConnected && user?._id) {
        // Try to reconnect if disconnected
        socketService.connect();
      }
    };

    checkSocketConnection();

    // Set up a socket event listener
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);

    if (socketService.socket) {
      socketService.socket.on("connect", onConnect);
      socketService.socket.on("disconnect", onDisconnect);
    }

    // Setup periodic connection check
    const intervalId = setInterval(checkSocketConnection, 10000);

    return () => {
      if (socketService.socket) {
        socketService.socket.off("connect", onConnect);
        socketService.socket.off("disconnect", onDisconnect);
      }
      clearInterval(intervalId);
    };
  }, [user]);

  // Clean up backend notifications
  const validBackendNotifications = useMemo(() => {
    return notifications.filter(
      (notif) =>
        notif && notif._id && notif.message && typeof notif.message === "string"
    );
  }, [notifications]);

  // Clean up local notifications
  const validLocalNotifications = useMemo(() => {
    return localNotifications.filter(
      (notif) =>
        notif && notif.id && notif.message && typeof notif.message === "string"
    );
  }, [localNotifications]);

  // Combine all notifications
  const allNotifications = useMemo(() => {
    const combinedNotifications = [
      ...validBackendNotifications,
      ...validLocalNotifications.map((local) => ({
        _id: local.id,
        message: local.message,
        type: local.type || "general",
        createdAt: local.timestamp || new Date(),
        readBy: local.readBy || [],
        isRead: local.isRead || false,
        rideData: local.rideData || null,
        statusData: local.statusData || null,
        forRole: local.forRole || "all", // Role targeting
      })),
    ];

    // Sort by date (newest first)
    return combinedNotifications.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [validBackendNotifications, validLocalNotifications]);

  // Helper function to check if a notification is unread
  const isNotificationUnread = (notification) => {
    // Check both isRead flag and readBy array
    if (notification.isRead === true) return false;
    if (
      notification.readBy &&
      notification.readBy.some((id) => id === user?._id)
    )
      return false;
    return true;
  };

  // Filter notifications based on filter selection and search term
  const filteredNotifications = useMemo(() => {
    return allNotifications
      .filter((notif) => {
        // First filter by role relevance
        if (
          notif.forRole &&
          notif.forRole !== "all" &&
          notif.forRole !== user?.role
        ) {
          return false;
        }

        // Then filter by category/type
        if (filter === "all") return true;

        if (filter === "ride") {
          return (
            notif.type &&
            (notif.type.includes("ride") ||
              notif.type === "driver_ride_request" ||
              notif.type === "ride_accepted" ||
              notif.type === "ride_completed" ||
              notif.type === "ride_canceled" ||
              notif.type === "ride_rejected")
          );
        }

        if (filter === "trip") {
          return notif.type && notif.type.includes("trip");
        }

        if (filter === "unread") {
          return isNotificationUnread(notif);
        }

        return notif.type === filter;
      })
      .filter((notif) => {
        // Then filter by search term if any
        if (!searchTerm) return true;
        return notif.message.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [allNotifications, filter, user, searchTerm]);

  // Setup click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Fetch notifications when panel opens
  useEffect(() => {
    if (user?._id && isOpen) {
      console.log("Fetching notifications...");
      dispatch(fetchNotifications())
        .unwrap()
        .then((response) => {
          console.log("Notifications fetched successfully:", response);
        })
        .catch((error) => {
          console.error("Error fetching notifications:", error);
          toast.error(`Failed to load notifications: ${error}`);
        });

      // Also update the unread count
      dispatch(getUnreadCount())
        .unwrap()
        .then((response) => {
          console.log("Unread count fetched successfully:", response);
        })
        .catch((error) => {
          console.error("Error fetching unread count:", error);
        });
    }
  }, [dispatch, user?._id, isOpen]);

  // Handle notifications from socket
  useEffect(() => {
    if (!socketService.socket || !user?._id) return;

    const handleNewNotification = (data) => {
      console.log("New notification received:", data);
      if (data && data._id) {
        // Add notification to redux state
        dispatch(addNotification(data));

        // Show toast if notification panel is closed
        if (!isOpen) {
          toast.info(data.message, {
            action: {
              label: "View",
              onClick: () => navigate("/notifications"),
            },
          });
        }
      }
    };

    // Listen for both possible event names
    socketService.socket.on("new_notification", handleNewNotification);
    socketService.socket.on("notification", handleNewNotification);

    return () => {
      socketService.socket.off("new_notification", handleNewNotification);
      socketService.socket.off("notification", handleNewNotification);
    };
  }, [dispatch, socketService.socket, user?._id, isOpen, navigate]);

  // Show error if any
  useEffect(() => {
    if (error) {
      toast.error(`Notification error: ${error}`);
    }
  }, [error]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    if (!notificationId || processingAction) return;

    setProcessingAction(true);
    console.log("Marking notification as read:", notificationId);

    try {
      // Handle backend notifications
      if (validBackendNotifications.some((n) => n._id === notificationId)) {
        await dispatch(markNotificationAsRead(notificationId)).unwrap();
        console.log("Notification marked as read successfully");
        toast.success("Notification marked as read");
      }
      // Handle local notifications
      else if (clearSingleNotification) {
        clearSingleNotification(notificationId);
        toast.success("Notification marked as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error(`Failed to mark notification as read: ${error}`);
    } finally {
      setProcessingAction(false);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (processingAction || allNotifications.length === 0) return;

    setProcessingAction(true);
    console.log("Marking all notifications as read");

    try {
      // Mark backend notifications as read
      await dispatch(markAllAsRead()).unwrap();
      console.log("All notifications marked as read successfully");

      // Clear local notifications
      if (clearLocalNotifications) {
        clearLocalNotifications();
      }

      toast.success("All notifications marked as read");

      // Update unread count
      dispatch(getUnreadCount());
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error(`Failed to mark all as read: ${error}`);
    } finally {
      setProcessingAction(false);
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    if (!notificationId || processingAction) return;

    setProcessingAction(true);
    console.log("Deleting notification:", notificationId);

    try {
      // Handle backend notifications
      if (validBackendNotifications.some((n) => n._id === notificationId)) {
        await dispatch(deleteNotification(notificationId)).unwrap();
        console.log("Notification deleted successfully");
        toast.success("Notification deleted");
      }
      // Handle local notifications
      else if (clearSingleNotification) {
        clearSingleNotification(notificationId);
        toast.success("Notification deleted");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error(`Failed to delete notification: ${error}`);
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle accepting a ride
  const handleAcceptRide = (rideData) => {
    if (!user || !rideData || !rideData.rideId || processingAction) {
      toast.error("Invalid ride data or user information");
      return;
    }

    setProcessingAction(true);
    console.log("Accepting ride:", rideData);

    try {
      if (!socketService.connected) {
        toast.error("Not connected to server. Reconnecting...");
        socketService.connect();
        setProcessingAction(false);
        return;
      }

      // Create payload with valid data
      const payload = {
        rideId: rideData.rideId,
        driverId: user._id,
        driverName: user.fullName || user.username || "Driver",
        driverPhone: user.phone || "",
        passengerId: rideData.passengerId,
        estimatedArrival: "10-15 minutes",
        acceptedAt: new Date(),
      };

      // Join the ride room for real-time updates
      socketService.joinRideRoom(rideData.rideId);

      // Emit socket event
      socketService.socket.emit("ride_accepted", payload, (response) => {
        if (response && response.success) {
          console.log("Ride accepted successfully:", response);
          toast.success("Ride accepted successfully!");

          // Mark the notification as read
          if (rideData.notificationId) {
            handleMarkAsRead(rideData.notificationId);
          }

          // Navigate to driver ride status page
          navigate("/driverridestatus", {
            state: { rideId: rideData.rideId },
          });
          onClose();
        } else {
          console.error("Failed to accept ride:", response);
          toast.error(response?.message || "Failed to accept ride");
        }
        setProcessingAction(false);
      });
    } catch (error) {
      console.error("Error accepting ride:", error);
      toast.error("Failed to accept ride. Please try again.");
      setProcessingAction(false);
    }
  };

  // Handle view details and navigate to appropriate page
  const handleViewDetails = (notification) => {
    if (!notification) return;

    // Mark as read
    handleMarkAsRead(notification._id);

    // Switch to "all" filter if currently on "unread" filter
    if (filter === "unread") {
      setFilter("all");
    }

    // Navigate based on type
    if (notification.type && notification.type.includes("ride")) {
      if (user?.role === "driver") {
        navigate("/driverridestatus", {
          state: notification.rideData
            ? { rideId: notification.rideData.rideId }
            : undefined,
        });
      } else {
        navigate("/ridestatus", {
          state: notification.rideData
            ? { rideId: notification.rideData.rideId }
            : undefined,
        });
      }
    } else if (notification.type && notification.type.includes("trip")) {
      navigate("/trips");
    } else {
      // For other notification types
      navigate("/notifications");
    }

    onClose();
  };

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";

    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;

      if (isNaN(diffMs)) return "Just now";

      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString();
    } catch (error) {
      return "Just now";
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    if (!type) return <Bell className="h-5 w-5 text-blue-500" />;

    type = type.toLowerCase();

    if (type.includes("trip")) {
      return <Car className="h-5 w-5 text-green-500" />;
    }

    if (type.includes("ride_request") || type === "driver_ride_request") {
      return <MapPin className="h-5 w-5 text-red-500" />;
    }

    if (type.includes("ride_accepted") || type === "ride_accepted") {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    if (type.includes("ride_rejected") || type === "ride_rejected") {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }

    if (type.includes("ride_canceled") || type === "ride_canceled") {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }

    if (type.includes("ride_completed") || type === "ride_completed") {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }

    if (type.includes("ride")) {
      return <Car className="h-5 w-5 text-blue-500" />;
    }

    return <Bell className="h-5 w-5 text-blue-500" />;
  };

  // Count unread notifications
  const unreadCount = useMemo(() => {
    return allNotifications.filter(isNotificationUnread).length;
  }, [allNotifications]);

  // Calculate counts for different notification types
  const categoryCounts = useMemo(() => {
    const counts = {
      ride: 0,
      trip: 0,
      unread: unreadCount,
    };

    allNotifications.forEach((notif) => {
      if (
        notif.type &&
        (notif.type.includes("ride") || notif.type === "driver_ride_request")
      ) {
        counts.ride++;
      }

      if (notif.type && notif.type.includes("trip")) {
        counts.trip++;
      }
    });

    return counts;
  }, [allNotifications, unreadCount]);

  // If not open, don't render
  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl py-2 border border-gray-100 z-50 max-h-[90vh] flex flex-col overflow-hidden"
      style={{ maxHeight: "80vh" }}
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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-xs text-gray-500 hover:text-blue-600"
              title="Search notifications"
            >
              <Search className="h-4 w-4" />
            </button>
            {allNotifications.length > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={processingAction || unreadCount === 0}
                className={`text-xs ${
                  processingAction || unreadCount === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-500 hover:text-green-600"
                }`}
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Search box - only shown when search is active */}
        {showSearch && (
          <div className="mt-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notifications..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              autoFocus
            />
          </div>
        )}

        {/* Connection status indicator */}
        <div
          className={`flex items-center mt-2 text-xs ${
            socketConnected ? "text-green-600" : "text-red-500"
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-1 ${
              socketConnected ? "bg-green-600" : "bg-red-500"
            }`}
          ></div>
          <span>
            {socketConnected ? "Connected" : "Offline - Reconnecting..."}
          </span>
        </div>

        {/* Category filters */}
        <div className="mt-2 flex space-x-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setFilter("all")}
            className={`text-xs px-2 py-1 rounded-full flex items-center whitespace-nowrap ${
              filter === "all"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Bell className="h-3 w-3 mr-1" />
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`text-xs px-2 py-1 rounded-full flex items-center whitespace-nowrap ${
              filter === "unread"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Unread
            {categoryCounts.unread > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                {categoryCounts.unread}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter("ride")}
            className={`text-xs px-2 py-1 rounded-full flex items-center whitespace-nowrap ${
              filter === "ride"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Car className="h-3 w-3 mr-1" />
            Rides
            {categoryCounts.ride > 0 && (
              <span className="ml-1 bg-blue-500 text-white text-xs px-1.5 rounded-full">
                {categoryCounts.ride}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter("trip")}
            className={`text-xs px-2 py-1 rounded-full flex items-center whitespace-nowrap ${
              filter === "trip"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Navigation className="h-3 w-3 mr-1" />
            Trips
            {categoryCounts.trip > 0 && (
              <span className="ml-1 bg-green-500 text-white text-xs px-1.5 rounded-full">
                {categoryCounts.trip}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && filteredNotifications.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-green-500 border-r-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">
              Loading notifications...
            </p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => {
            const isRead = !isNotificationUnread(notif);
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

                    {/* Ride request action buttons for drivers */}
                    {user?.role === "driver" &&
                      notif.type &&
                      (notif.type.includes("ride_request") ||
                        notif.type === "driver_ride_request") &&
                      notif.rideData &&
                      notif.rideData.rideId && (
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() =>
                              handleAcceptRide({
                                ...notif.rideData,
                                notificationId: notif._id,
                              })
                            }
                            disabled={processingAction}
                            className={`flex items-center px-2 py-1 ${
                              processingAction
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600"
                            } text-white text-xs rounded`}
                          >
                            {processingAction ? (
                              <div className="h-3 w-3 animate-spin rounded-full border border-white border-r-transparent mr-1"></div>
                            ) : (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            )}
                            Accept
                          </button>
                          <button
                            onClick={() => handleMarkAsRead(notif._id)}
                            disabled={processingAction}
                            className={`flex items-center px-2 py-1 ${
                              processingAction
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-gray-300 hover:bg-gray-400"
                            } text-gray-700 text-xs rounded`}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Ignore
                          </button>
                        </div>
                      )}

                    {/* View details button */}
                    {!notif.type?.includes("ride_request") && (
                      <button
                        onClick={() => handleViewDetails(notif)}
                        disabled={processingAction}
                        className={`mt-2 text-xs ${
                          processingAction
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-600 hover:text-blue-800"
                        } font-medium`}
                      >
                        View Details
                      </button>
                    )}

                    {/* Show ride details if it's a ride notification with valid data */}
                    {notif.rideData &&
                      (notif.rideData.fare || notif.rideData.distance) && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs text-gray-600">
                          {notif.rideData.fare && (
                            <div className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1 text-green-500" />
                              <span>Fare: NPR {notif.rideData.fare}</span>
                            </div>
                          )}
                          {notif.rideData.distance && (
                            <div className="flex items-center mt-1">
                              <Navigation className="h-3 w-3 mr-1 text-blue-500" />
                              <span>
                                Distance:{" "}
                                {Number(notif.rideData.distance).toFixed(1)} km
                              </span>
                            </div>
                          )}

                          {/* Contact options for ride-related notifications */}
                          {(notif.type?.includes("ride_accepted") ||
                            notif.type?.includes("ride_picked_up")) && (
                            <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between">
                              {user?.role === "user" &&
                                notif.rideData.driverPhone && (
                                  <a
                                    href={`tel:${notif.rideData.driverPhone}`}
                                    className="flex items-center text-blue-600"
                                  >
                                    <PhoneCall className="h-3 w-3 mr-1" />
                                    <span>Call Driver</span>
                                  </a>
                                )}
                              <a
                                href={`/chats/${notif.rideData.rideId}`}
                                className="flex items-center text-blue-600"
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                <span>Message</span>
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                  <div className="flex flex-col items-center space-y-1 ml-2">
                    {!isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif._id)}
                        disabled={processingAction}
                        className={`p-1 ${
                          processingAction
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-400 hover:text-green-600 hover:bg-gray-100"
                        } rounded-full`}
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif._id)}
                      disabled={processingAction}
                      className={`p-1 ${
                        processingAction
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-400 hover:text-red-600 hover:bg-gray-100"
                      } rounded-full`}
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
          <div className="px-4 py-10 text-center">
            <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No notifications available</p>
            {filter !== "all" && (
              <p className="text-xs text-gray-400 mt-1">
                Try changing your filter
              </p>
            )}
            {searchTerm && (
              <p className="text-xs text-gray-400 mt-1">
                No results found for "{searchTerm}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-100">
        <button
          onClick={onClose}
          className="w-full px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NotificationCenter;
