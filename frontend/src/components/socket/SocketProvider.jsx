import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useSelector } from "react-redux";
import socketService from "../socket/socketService";

// Create a context for socket state
const SocketContext = createContext(null);

// Custom hook to access socket state
export const useSocket = () => useContext(SocketContext);

/**
 * Socket Provider component to manage socket connection throughout the app
 */
export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  // Handle socket reconnection with exponential backoff
  const handleReconnect = useCallback(() => {
    if (reconnecting) return;

    setReconnecting(true);
    setConnectionAttempts((prev) => prev + 1);

    // Exponential backoff: 1s, 2s, 4s, 8s, etc. up to 30s max
    const delay = Math.min(30000, Math.pow(2, connectionAttempts) * 1000);

    console.log(
      `Socket reconnection attempt ${connectionAttempts} in ${delay / 1000}s`
    );

    setTimeout(() => {
      if (!socketService.connected) {
        socketService.connect();
      }
      setReconnecting(false);
    }, delay);
  }, [reconnecting, connectionAttempts]);

  // Send user info to socket
  const updateUserInfo = useCallback(() => {
    if (isAuthenticated && user?._id && connected) {
      console.log("Updating socket user info:", user._id, user.role);
      socketService.sendUserInfo(user._id, user.role);

      // If user is a driver, also set them as available
      if (user.role === "driver") {
        setTimeout(() => {
          socketService.setDriverAvailable();
        }, 500); // Small delay to ensure user info is processed first
      }

      // Fetch notifications after connection is established
      setTimeout(() => {
        socketService.getNotifications();
      }, 1000);
    }
  }, [isAuthenticated, user, connected]);

  // Function to mark a notification as read
  const markNotificationRead = useCallback((notificationId) => {
    socketService.markNotificationRead(notificationId);

    // Update local state immediately for a responsive UI
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
    );

    // Update unread count
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Mark all notifications as read
  const markAllNotificationsRead = useCallback(() => {
    socketService.markAllNotificationsRead();

    // Update local state immediately
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // Reset unread count
    setUnreadCount(0);
  }, []);

  // Connect socket and set up event listeners
  useEffect(() => {
    // Only initialize socket if not already connected
    if (!socketService.connected) {
      try {
        socketService.connect();
      } catch (error) {
        console.error("Socket connection error:", error);
        handleReconnect();
      }
    }

    // Connection event handlers
    const handleConnect = () => {
      console.log("🔌 Socket connected in provider");
      setConnected(true);
      setConnectionAttempts(0);

      // Send user info if user is authenticated
      if (isAuthenticated && user?._id) {
        updateUserInfo();
      }
    };

    const handleDisconnect = (reason) => {
      console.log(`🔌 Socket disconnected in provider: ${reason}`);
      setConnected(false);

      // Attempt to reconnect for certain disconnect reasons
      if (
        reason === "io server disconnect" ||
        reason === "transport close" ||
        reason === "transport error"
      ) {
        handleReconnect();
      }
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error);
      setConnected(false);
      handleReconnect();
    };

    const handleReconnectEvent = (attemptNumber) => {
      console.log(
        `Socket automatically reconnecting (attempt ${attemptNumber})`
      );
      setReconnecting(true);
    };

    const handleReconnectSuccess = () => {
      console.log("Socket successfully reconnected");
      setReconnecting(false);
      setConnectionAttempts(0);

      // Re-send user info
      if (isAuthenticated && user?._id) {
        updateUserInfo();
      }
    };

    // Set up listeners
    const socket = socketService.getSocket();
    if (socket) {
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("connect_error", handleConnectError);
      socket.on("reconnect_attempt", handleReconnectEvent);
      socket.on("reconnect", handleReconnectSuccess);

      // Set initial state
      setConnected(socket.connected);
    }

    // Clean up listeners
    return () => {
      if (socket) {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("connect_error", handleConnectError);
        socket.off("reconnect_attempt", handleReconnectEvent);
        socket.off("reconnect", handleReconnectSuccess);
      }
    };
  }, [isAuthenticated, user, handleReconnect, updateUserInfo]);

  // Register notification handlers
  useEffect(() => {
    if (!connected) return;

    // Handle incoming notifications
    const handleNotification = (notification) => {
      console.log("📬 Received notification:", notification);

      // Add to notifications if not already there
      setNotifications((prev) => {
        // Check if notification already exists
        const exists = prev.some((n) => n._id === notification._id);
        if (exists) return prev;

        // Add new notification at beginning of array
        return [notification, ...prev];
      });

      // Update unread count
      if (!notification.read) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    // Handle notification list received from server
    const handleNotificationsList = (data) => {
      console.log("📬 Received notifications list:", data);
      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);

        // Count unread notifications
        const unreadCount = data.notifications.filter((n) => !n.read).length;
        setUnreadCount(unreadCount);
      }
    };

    // Register handlers using the custom event system
    const unsubNotification = socketService.on(
      "notification",
      handleNotification
    );
    const unsubNotificationsList = socketService.on(
      "notifications_list",
      handleNotificationsList
    );

    // Event handlers for trip-related events
    const handleTripEvent = (eventName) => (data) => {
      console.log(`🚗 ${eventName} event received:`, data);

      // These events should trigger a notification refresh
      socketService.getNotifications();
    };

    // Register handlers for various trip events
    const unsubNewTrip = socketService.on(
      "new_trip_available",
      handleTripEvent("New trip available")
    );
    const unsubTripCreated = socketService.on(
      "trip_created",
      handleTripEvent("Trip created")
    );
    const unsubTripUpdated = socketService.on(
      "trip_updated",
      handleTripEvent("Trip updated")
    );
    const unsubTripCancelled = socketService.on(
      "trip_cancelled",
      handleTripEvent("Trip cancelled")
    );
    const unsubTripCompleted = socketService.on(
      "trip_completed",
      handleTripEvent("Trip completed")
    );
    const unsubTripDeleted = socketService.on(
      "trip_deleted",
      handleTripEvent("Trip deleted")
    );
    const unsubBookingCreated = socketService.on(
      "booking_created",
      handleTripEvent("Booking created")
    );
    const unsubBookingAccepted = socketService.on(
      "booking_accepted",
      handleTripEvent("Booking accepted")
    );
    const unsubBookingRejected = socketService.on(
      "booking_rejected",
      handleTripEvent("Booking rejected")
    );
    const unsubBookingCancelled = socketService.on(
      "booking_cancelled",
      handleTripEvent("Booking cancelled")
    );

    return () => {
      // Cleanup all event handlers
      unsubNotification();
      unsubNotificationsList();
      unsubNewTrip();
      unsubTripCreated();
      unsubTripUpdated();
      unsubTripCancelled();
      unsubTripCompleted();
      unsubTripDeleted();
      unsubBookingCreated();
      unsubBookingAccepted();
      unsubBookingRejected();
      unsubBookingCancelled();
    };
  }, [connected]);

  // Send user info whenever auth state changes
  useEffect(() => {
    if (isAuthenticated && user?._id && connected) {
      updateUserInfo();
    }

    // On logout, clear socket user data
    if (!isAuthenticated && socketService.userId) {
      console.log("User logged out, clearing socket user data");
      socketService.clearUserData();

      // Also clear notifications
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user, connected, updateUserInfo]);

  // Ping the server every 25 seconds to keep the connection alive
  useEffect(() => {
    if (!connected) return;

    const pingInterval = setInterval(() => {
      const socket = socketService.getSocket();
      if (socket && socket.connected) {
        // Send a lightweight ping to prevent timeouts
        socket.emit("ping", { timestamp: Date.now() });
      }
    }, 25000);

    return () => clearInterval(pingInterval);
  }, [connected]);

  // Create memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      connected,
      reconnecting,
      socket: socketService.getSocket(),
      socketService,
      connectionAttempts,
      forceReconnect: () => {
        if (socketService.socket) {
          socketService.disconnect();
          setTimeout(() => {
            socketService.connect();
          }, 500);
        }
      },
      // Add notification-related functionality
      notifications,
      unreadCount,
      markNotificationRead,
      markAllNotificationsRead,
      refreshNotifications: () => socketService.getNotifications(),
      // Helper for trip-related operations
      joinTripRoom: (tripId) => socketService.joinTripRoom(tripId),
      leaveTripRoom: (tripId) => socketService.leaveTripRoom(tripId),
      bookTrip: (bookingData) => socketService.bookTrip(bookingData),
      cancelBooking: (cancellationData) =>
        socketService.cancelBooking(cancellationData),
    }),
    [
      connected,
      reconnecting,
      connectionAttempts,
      notifications,
      unreadCount,
      markNotificationRead,
      markAllNotificationsRead,
    ]
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
