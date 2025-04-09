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
    }
  }, [isAuthenticated, user, connected]);

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

  // Send user info whenever auth state changes
  useEffect(() => {
    if (isAuthenticated && user?._id && connected) {
      updateUserInfo();
    }

    // On logout, clear socket user data
    if (!isAuthenticated && socketService.userId) {
      console.log("User logged out, clearing socket user data");
      socketService.clearUserData();
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
    }),
    [connected, reconnecting, connectionAttempts]
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
