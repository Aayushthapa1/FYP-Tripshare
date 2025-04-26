"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  Check,
  Trash2,
  Car,
  MapPin,
  CheckCircle,
  X,
  Navigation,
  DollarSign,
  AlertTriangle,
  XCircle,
  PhoneCall,
  MessageSquare,
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
 * Helper function to generate a message from trip event data
 */
const getMessageFromTripEvent = (eventData) => {
  if (!eventData) return "New trip notification";

  const eventType = eventData.eventType || "";

  switch (eventType) {
    case "new_trip_available":
      return `New trip available from ${eventData.departureLocation} to ${eventData.destinationLocation}`;
    case "trip_created":
      return `Trip from ${eventData.departureLocation} to ${eventData.destinationLocation} has been created`;
    case "trip_updated":
      return `Trip details have been updated for journey from ${eventData.departureLocation} to ${eventData.destinationLocation}`;
    case "trip_cancelled":
      return `Trip from ${eventData.departureLocation} to ${eventData.destinationLocation} has been cancelled`;
    case "trip_completed":
      return `Trip from ${eventData.departureLocation} to ${eventData.destinationLocation} has been completed`;
    case "trip_deleted":
      return `Trip from ${eventData.departureLocation} to ${eventData.destinationLocation} has been deleted`;
    case "booking_created":
      return `New booking request for trip from ${eventData.departureLocation} to ${eventData.destinationLocation}`;
    case "booking_accepted":
      return `Your booking has been accepted for trip from ${eventData.departureLocation} to ${eventData.destinationLocation}`;
    case "booking_rejected":
      return `Your booking was not accepted for trip from ${eventData.departureLocation} to ${eventData.destinationLocation}`;
    case "booking_cancelled":
      return `Booking cancelled for trip from ${eventData.departureLocation} to ${eventData.destinationLocation}`;
    default:
      return `Trip notification: ${eventData.departureLocation} to ${eventData.destinationLocation}`;
  }
};

/**
 * NotificationCenter component
 * Displays and manages all notifications for the user
 */
const NotificationCenter = ({
  localNotifications = [],
  clearLocalNotifications,
  clearSingleNotification,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
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

  // Local state for toggle functionality
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Determine if the component is controlled externally or internally
  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  // Handle closing the notification panel
  const handleClose = () => {
    if (isControlled && externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  // Toggle the notification panel
  const toggleOpen = () => {
    if (isControlled && externalOnClose) {
      externalOnClose(!externalIsOpen);
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

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
        tripData: local.tripData || null,
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
          return (
            notif.type &&
            (notif.type.includes("trip") || notif.type.includes("booking"))
          );
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
        if (isControlled && externalOnClose) {
          externalOnClose();
        } else {
          setInternalIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isControlled, externalOnClose, setInternalIsOpen]);

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

    // Handle trip-specific events and convert them to notifications if needed
    const handleTripEvent = (eventData) => {
      console.log("Trip event received:", eventData);

      // If the event already contains a notification structure, use that directly
      if (eventData && eventData._id && eventData.message) {
        handleNewNotification(eventData);
        return;
      }

      // Otherwise, create a notification from the event data
      if (eventData && eventData.tripId) {
        // Set the event type for message generation
        const eventType = eventData.type || socketService.socket.lastEventId;

        const notificationData = {
          _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          message: getMessageFromTripEvent({ ...eventData, eventType }),
          type: eventType || "trip_update",
          createdAt: eventData.timestamp || new Date(),
          readBy: [],
          isRead: false,
          tripData: {
            tripId: eventData.tripId,
            departureLocation: eventData.departureLocation,
            destinationLocation: eventData.destinationLocation,
            departureDate: eventData.departureDate,
            departureTime: eventData.departureTime,
            price: eventData.price,
            availableSeats: eventData.availableSeats,
          },
        };

        dispatch(addNotification(notificationData));

        // Show toast if notification panel is closed
        if (!isOpen) {
          toast.info(notificationData.message, {
            action: {
              label: "View",
              onClick: () => navigate("/trips"),
            },
          });
        }
      }
    };

    // Listen for both notification and trip-specific events
    socketService.socket.on("new_notification", handleNewNotification);
    socketService.socket.on("notification", handleNewNotification);

    // Add listeners for trip-specific events
    socketService.socket.on("new_trip_available", handleTripEvent);
    socketService.socket.on("trip_created", handleTripEvent);
    socketService.socket.on("trip_updated", handleTripEvent);
    socketService.socket.on("trip_cancelled", handleTripEvent);
    socketService.socket.on("trip_completed", handleTripEvent);
    socketService.socket.on("trip_deleted", handleTripEvent);
    socketService.socket.on("trip_details_changed", handleTripEvent);
    socketService.socket.on("booking_created", handleTripEvent);
    socketService.socket.on("booking_accepted", handleTripEvent);
    socketService.socket.on("booking_rejected", handleTripEvent);
    socketService.socket.on("booking_cancelled", handleTripEvent);

    return () => {
      socketService.socket.off("new_notification", handleNewNotification);
      socketService.socket.off("notification", handleNewNotification);

      // Clean up trip-specific event listeners
      socketService.socket.off("new_trip_available", handleTripEvent);
      socketService.socket.off("trip_created", handleTripEvent);
      socketService.socket.off("trip_updated", handleTripEvent);
      socketService.socket.off("trip_cancelled", handleTripEvent);
      socketService.socket.off("trip_completed", handleTripEvent);
      socketService.socket.off("trip_deleted", handleTripEvent);
      socketService.socket.off("trip_details_changed", handleTripEvent);
      socketService.socket.off("booking_created", handleTripEvent);
      socketService.socket.off("booking_accepted", handleTripEvent);
      socketService.socket.off("booking_rejected", handleTripEvent);
      socketService.socket.off("booking_cancelled", handleTripEvent);
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
          handleClose();
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
    } else if (
      notification.type &&
      (notification.type.includes("trip") ||
        notification.type.includes("booking"))
    ) {
      // For trip-related notifications, navigate to trips page
      if (notification.tripData && notification.tripData.tripId) {
        // If we have a specific trip ID, navigate to that trip's details
        navigate(`/trips/${notification.tripData.tripId}`);
      } else {
        // Otherwise, just go to the trips list
        navigate("/trips");
      }
    } else {
      // For other notification types
      navigate("/notifications");
    }

    handleClose();
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
    if (!type) return <Bell className="h-5 w-5 text-green-500" />;

    type = type.toLowerCase();

    if (type.includes("trip")) {
      return <Car className="h-5 w-5 text-green-500" />;
    }

    if (type.includes("booking")) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
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
      return <Car className="h-5 w-5 text-green-500" />;
    }

    return <Bell className="h-5 w-5 text-green-500" />;
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

      if (
        notif.type &&
        (notif.type.includes("trip") || notif.type.includes("booking"))
      ) {
        counts.trip++;
      }
    });

    return counts;
  }, [allNotifications, unreadCount]);

  // If using external control and not open, don't render the dropdown
  if (isControlled && !isOpen) return null;

  return (
    <div className="relative inline-block">
      {/* Toggle Button - Only show if not externally controlled */}
      {!isControlled && (
        <button
          onClick={toggleOpen}
          className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full shadow-sm">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col overflow-hidden"
          style={{ maxHeight: "80vh" }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-sm font-semibold text-gray-800">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="text-xs text-gray-500 hover:text-green-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  title="Search notifications"
                >
                  <Search className="h-4 w-4" />
                </button>
                {allNotifications.length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={processingAction || unreadCount === 0}
                    className={`text-xs px-2 py-1 rounded-md transition-colors ${
                      processingAction || unreadCount === 0
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                    }`}
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Search box - only shown when search is active */}
            {showSearch && (
              <div className="mt-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search notifications..."
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 bg-white shadow-sm"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Connection status indicator */}
            <div
              className={`flex items-center mt-2 text-xs ${
                socketConnected ? "text-green-700" : "text-red-600"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-1 ${
                  socketConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              ></div>
              <span>
                {socketConnected ? "Connected" : "Offline - Reconnecting..."}
              </span>
            </div>

            {/* Category filters */}
            <div className="mt-3 flex space-x-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFilter("all")}
                className={`text-xs px-3 py-1.5 rounded-full flex items-center whitespace-nowrap transition-colors ${
                  filter === "all"
                    ? "bg-green-100 text-green-700 font-medium shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Bell className="h-3 w-3 mr-1" />
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`text-xs px-3 py-1.5 rounded-full flex items-center whitespace-nowrap transition-colors ${
                  filter === "unread"
                    ? "bg-green-100 text-green-700 font-medium shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                Unread
                {categoryCounts.unread > 0 && (
                  <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 rounded-full shadow-sm">
                    {categoryCounts.unread}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilter("ride")}
                className={`text-xs px-3 py-1.5 rounded-full flex items-center whitespace-nowrap transition-colors ${
                  filter === "ride"
                    ? "bg-green-100 text-green-700 font-medium shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Car className="h-3 w-3 mr-1" />
                Rides
                {categoryCounts.ride > 0 && (
                  <span className="ml-1.5 bg-green-500 text-white text-xs px-1.5 rounded-full shadow-sm">
                    {categoryCounts.ride}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilter("trip")}
                className={`text-xs px-3 py-1.5 rounded-full flex items-center whitespace-nowrap transition-colors ${
                  filter === "trip"
                    ? "bg-green-100 text-green-700 font-medium shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Navigation className="h-3 w-3 mr-1" />
                Trips
                {categoryCounts.trip > 0 && (
                  <span className="ml-1.5 bg-green-500 text-white text-xs px-1.5 rounded-full shadow-sm">
                    {categoryCounts.trip}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && filteredNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-green-500 border-r-transparent"></div>
                <p className="mt-3 text-sm text-gray-500">
                  Loading notifications...
                </p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => {
                const isRead = !isNotificationUnread(notif);
                return (
                  <div
                    key={notif._id}
                    className={`px-5 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                      !isRead ? "bg-green-50" : ""
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5 p-1.5 bg-gray-100 rounded-full">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <p
                          className={`text-sm leading-5 ${
                            !isRead
                              ? "font-medium text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300 mr-1.5"></span>
                          {formatTime(notif.createdAt)}
                        </p>

                        {/* Ride request action buttons for drivers */}
                        {user?.role === "driver" &&
                          notif.type &&
                          (notif.type.includes("ride_request") ||
                            notif.type === "driver_ride_request") &&
                          notif.rideData &&
                          notif.rideData.rideId && (
                            <div className="mt-3 flex space-x-2">
                              <button
                                onClick={() =>
                                  handleAcceptRide({
                                    ...notif.rideData,
                                    notificationId: notif._id,
                                  })
                                }
                                disabled={processingAction}
                                className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                  processingAction
                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    : "bg-green-500 text-white hover:bg-green-600 shadow-sm hover:shadow"
                                }`}
                              >
                                {processingAction ? (
                                  <div className="h-3 w-3 animate-spin rounded-full border border-white border-r-transparent mr-1.5"></div>
                                ) : (
                                  <CheckCircle className="h-3 w-3 mr-1.5" />
                                )}
                                Accept
                              </button>
                              <button
                                onClick={() => handleMarkAsRead(notif._id)}
                                disabled={processingAction}
                                className={`flex items-center px-3 py-1.5 rounded-md text-xs transition-all ${
                                  processingAction
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                <X className="h-3 w-3 mr-1.5" />
                                Ignore
                              </button>
                            </div>
                          )}

                        {/* Trip booking action buttons for drivers */}
                        {user?.role === "driver" &&
                          notif.type &&
                          notif.type.includes("booking_created") &&
                          notif.tripData &&
                          notif.tripData.tripId && (
                            <div className="mt-3 flex space-x-2">
                              <button
                                onClick={() => handleViewDetails(notif)}
                                disabled={processingAction}
                                className={`flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                  processingAction
                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    : "bg-green-500 text-white hover:bg-green-600 shadow-sm hover:shadow"
                                }`}
                              >
                                <Car className="h-3 w-3 mr-1.5" />
                                View Booking
                              </button>
                              <button
                                onClick={() => handleMarkAsRead(notif._id)}
                                disabled={processingAction}
                                className={`flex items-center px-3 py-1.5 rounded-md text-xs transition-all ${
                                  processingAction
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                <Check className="h-3 w-3 mr-1.5" />
                                Mark as Read
                              </button>
                            </div>
                          )}

                        {/* View details button */}
                        {!notif.type?.includes("ride_request") &&
                          !notif.type?.includes("booking_created") && (
                            <button
                              onClick={() => handleViewDetails(notif)}
                              disabled={processingAction}
                              className={`mt-2 text-xs px-3 py-1.5 rounded-md ${
                                processingAction
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
                              } font-medium transition-colors inline-flex items-center`}
                            >
                              <span>View Details</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 ml-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </button>
                          )}

                        {/* Show ride details if it's a ride notification with valid data */}
                        {notif.rideData &&
                          (notif.rideData.fare || notif.rideData.distance) && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-200 shadow-sm">
                              {notif.rideData.fare && (
                                <div className="flex items-center mb-1.5">
                                  <DollarSign className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                                  <span className="font-medium">
                                    Fare: NPR {notif.rideData.fare}
                                  </span>
                                </div>
                              )}
                              {notif.rideData.distance && (
                                <div className="flex items-center">
                                  <Navigation className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                                  <span>
                                    Distance:{" "}
                                    {Number(notif.rideData.distance).toFixed(1)}{" "}
                                    km
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
                                        className="flex items-center text-green-600 hover:text-green-700 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                                      >
                                        <PhoneCall className="h-3.5 w-3.5 mr-1" />
                                        <span>Call Driver</span>
                                      </a>
                                    )}
                                  <a
                                    href={`/chats/${notif.rideData.rideId}`}
                                    className="flex items-center text-green-600 hover:text-green-700 px-2 py-1 rounded hover:bg-green-50 transition-colors"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                    <span>Message</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                        {/* Show trip details if it's a trip notification with valid data */}
                        {notif.tripData &&
                          (notif.tripData.departureLocation ||
                            notif.tripData.price) && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 border border-gray-200 shadow-sm">
                              {notif.tripData.departureDate && (
                                <div className="flex items-center mb-1.5">
                                  <Calendar className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                                  <span>
                                    Date:{" "}
                                    {new Date(
                                      notif.tripData.departureDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              {notif.tripData.price && (
                                <div className="flex items-center mb-1.5">
                                  <DollarSign className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                                  <span className="font-medium">
                                    Price: NPR {notif.tripData.price}
                                  </span>
                                </div>
                              )}
                              {notif.tripData.availableSeats && (
                                <div className="flex items-center">
                                  <Users className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                                  <span>
                                    Seats: {notif.tripData.availableSeats}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                      <div className="flex flex-col items-center space-y-2 ml-2">
                        {!isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notif._id)}
                            disabled={processingAction}
                            className={`p-1.5 ${
                              processingAction
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                            } rounded-full transition-colors`}
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif._id)}
                          disabled={processingAction}
                          className={`p-1.5 ${
                            processingAction
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                          } rounded-full transition-colors`}
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
              <div className="px-4 py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  No notifications available
                </p>
                {filter !== "all" && (
                  <p className="text-xs text-gray-400 mt-2">
                    Try changing your filter
                  </p>
                )}
                {searchTerm && (
                  <p className="text-xs text-gray-400 mt-2">
                    No results found for "{searchTerm}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <button
              onClick={handleClose}
              className="w-full px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
