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
  const { notifications = [], isLoading } = useSelector(
    (state) => state.notification || { notifications: [] }
  );
  const { user } = useSelector((state) => state.auth) || {};

  // Refs
  const dropdownRef = useRef(null);

  // Local state
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Check socket connection
  useEffect(() => {
    setSocketConnected(socketService.connected);

    const checkConnection = () => {
      setSocketConnected(socketService.connected);
    };

    const intervalId = setInterval(checkConnection, 2000);

    return () => clearInterval(intervalId);
  }, []);

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
          return !notif.readBy || !notif.readBy.includes(user?._id);
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

    // Fetch notifications on mount
    if (user?._id) {
      dispatch(fetchNotifications());
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dispatch, onClose, user]);

  // Mark notification as read
  const handleMarkAsRead = (notificationId) => {
    if (!notificationId) return;

    // Handle backend notifications
    if (validBackendNotifications.some((n) => n._id === notificationId)) {
      dispatch(markNotificationAsRead(notificationId));
    }
    // Handle local notifications
    else if (clearSingleNotification) {
      clearSingleNotification(notificationId);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    // Mark backend notifications as read
    dispatch(markAllAsRead());

    // Clear local notifications
    if (clearLocalNotifications) {
      clearLocalNotifications();
    }

    toast.success("All notifications marked as read");
  };

  // Delete notification
  const handleDelete = (notificationId) => {
    if (!notificationId) return;

    // Handle backend notifications
    if (validBackendNotifications.some((n) => n._id === notificationId)) {
      dispatch(deleteNotification(notificationId));
    }
    // Handle local notifications
    else if (clearSingleNotification) {
      clearSingleNotification(notificationId);
    }
  };

  // Handle accepting a ride
  const handleAcceptRide = (rideData) => {
    if (!user || !rideData || !rideData.rideId) {
      toast.error("Invalid ride data or user information");
      return;
    }

    if (!socketService.connected) {
      toast.error("Not connected to server. Reconnecting...");
      socketService.connect();
      return;
    }

    console.log("Driver accepting ride:", rideData.rideId);

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

    // Emit socket event with error handling
    try {
      socketService.socket.emit("ride_accepted", payload);
      toast.success("Ride accepted successfully!");
    } catch (error) {
      console.error("Error accepting ride:", error);
      toast.error("Failed to accept ride. Please try again.");
      return;
    }

    // Navigate to driver ride status page
    navigate("/driverridestatus");
    onClose();
  };

  // Navigate to specific page based on notification type
  const handleViewDetails = (notification) => {
    if (!notification) return;

    // Mark as read
    handleMarkAsRead(notification._id);

    // Navigate based on type
    if (notification.type && notification.type.includes("ride")) {
      if (user.role === "driver") {
        navigate("/driverridestatus");
      } else {
        navigate("/ridestatus");
      }
    } else if (notification.type && notification.type.includes("trip")) {
      navigate("/trips");
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
    return allNotifications.filter(
      (notif) => !notif.readBy || !notif.readBy.includes(user?._id)
    ).length;
  }, [allNotifications, user]);

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
                className="text-xs text-gray-500 hover:text-green-600"
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

                    {/* Ride request action buttons for drivers */}
                    {user?.role === "driver" &&
                      notif.type &&
                      (notif.type.includes("ride_request") ||
                        notif.type === "driver_ride_request") &&
                      notif.rideData &&
                      notif.rideData.rideId && (
                        <div className="mt-2 flex space-x-2">
                          <button
                            onClick={() => handleAcceptRide(notif.rideData)}
                            className="flex items-center px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleMarkAsRead(notif._id)}
                            className="flex items-center px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
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
                        className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
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
                              {user.role === "user" &&
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
