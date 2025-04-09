import io from "socket.io-client";

class PersistentSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.connectionAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = null;
    this.userId = null;
    this.userRole = null;
    this.setupComplete = false;
    this.debugMode = true;
    this.connectionId = this.loadConnectionId() || this.generateConnectionId();
  }

  /**
   * Generate a unique connection ID for persistent sessions
   */
  generateConnectionId() {
    const id = `conn_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    localStorage.setItem("tripshare_connection_id", id);
    return id;
  }

  /**
   * Load a saved connection ID if available
   */
  loadConnectionId() {
    return localStorage.getItem("tripshare_connection_id");
  }

  /**
   * Save user data to localStorage for persistent connections
   */
  saveUserData(userId, role) {
    if (userId) {
      localStorage.setItem("tripshare_user_id", userId);
      localStorage.setItem("tripshare_user_role", role || "user");
      this.userId = userId;
      this.userRole = role || "user";
    }
  }

  /**
   * Load saved user data if available
   */
  loadUserData() {
    const userId = localStorage.getItem("tripshare_user_id");
    const role = localStorage.getItem("tripshare_user_role");
    if (userId) {
      this.userId = userId;
      this.userRole = role || "user";
      return { userId, role };
    }
    return null;
  }

  /**
   * Connect to the socket server
   */
  connect() {
    // If already connected, return existing socket
    if (this.connected && this.socket) {
      this.log("Socket already connected");
      return this.socket;
    }

    // Clear any existing reconnect interval
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    const BACKEND_URL = "http://localhost:3301";

    try {
      this.log("Connecting to socket server at:", BACKEND_URL);

      // Load saved user data for reconnection
      const userData = this.loadUserData();

      // Initialize socket connection with auth and connection ID
      this.socket = io(BACKEND_URL, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
        autoConnect: true,
        transports: ["websocket", "polling"],
        auth: {
          connectionId: this.connectionId,
          userId: userData?.userId,
          userRole: userData?.role,
        },
      });

      // Set up connection handlers
      this.setupConnectionHandlers();

      return this.socket;
    } catch (error) {
      this.error("Socket connection error:", error.message);
      this.handleConnectionError();
      return null;
    }
  }

  /**
   * Setup socket connection event handlers
   */
  setupConnectionHandlers() {
    if (!this.socket || this.setupComplete) return;

    this.socket.on("connect", () => {
      this.log("Socket connected successfully:", this.socket.id);
      this.connected = true;
      this.connectionAttempts = 0;

      // If we have stored user info, send it on reconnect
      const userData = this.loadUserData();
      if (userData?.userId) {
        this.sendUserInfo(userData.userId, userData.role);
      }
    });

    this.socket.on("connection_acknowledged", (data) => {
      this.log("Connection acknowledged by server:", data);
    });

    this.socket.on("disconnect", (reason) => {
      this.log("Socket disconnected:", reason);
      this.connected = false;

      // Attempt to reconnect for certain disconnect reasons
      if (
        reason === "io server disconnect" ||
        reason === "transport close" ||
        reason === "transport error"
      ) {
        this.handleConnectionError();
      }
    });

    this.socket.on("connect_error", (err) => {
      this.error("Socket connect_error:", err.message);
      this.connected = false;
      this.handleConnectionError();
    });

    this.socket.on("error", (error) => {
      this.error("Socket error:", error);
    });

    // Add handler for auto-reconnection with the same user info
    this.socket.io.on("reconnect", () => {
      this.log("Socket reconnected automatically");

      // Re-send user info on reconnect
      const userData = this.loadUserData();
      if (userData?.userId) {
        this.sendUserInfo(userData.userId, userData.role);
      }
    });

    this.setupComplete = true;
  }

  /**
   * Handle connection errors with exponential backoff
   */
  handleConnectionError() {
    this.connectionAttempts++;

    if (this.connectionAttempts <= this.maxReconnectAttempts) {
      const delay = Math.min(
        30000,
        Math.pow(2, this.connectionAttempts) * 1000
      );

      this.log(
        `Will attempt reconnection (${this.connectionAttempts}/${
          this.maxReconnectAttempts
        }) in ${delay / 1000}s`
      );

      if (!this.reconnectInterval) {
        this.reconnectInterval = setInterval(() => {
          if (this.connected) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
            return;
          }

          this.log("Attempting to reconnect...");

          if (this.socket) {
            this.socket.connect();
          } else {
            this.connect();
          }

          if (this.connectionAttempts >= this.maxReconnectAttempts) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
          }
        }, delay);
      }
    } else {
      this.error(
        "Max reconnection attempts reached. Please refresh the page to try again."
      );
      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }
    }
  }

  /**
   * Send user information to the socket server
   * @param {string} userId - User ID
   * @param {string} role - User role (driver, user)
   */
  sendUserInfo(userId, role) {
    if (!this.socket) {
      this.error("Cannot send user info: Socket not initialized");
      return false;
    }

    if (!userId) {
      this.error("Cannot send user info: No user ID provided");
      return false;
    }

    this.log(
      `Sending user info to socket server - ID: ${userId}, Role: ${
        role || "user"
      }`
    );

    // Save for persistent storage
    this.saveUserData(userId, role || "user");

    // Send the user_connected event
    this.socket.emit("user_connected", {
      userId: userId,
      role: role || "user",
      connectionId: this.connectionId,
      timestamp: new Date(),
    });

    // If the user is a driver, also register as available
    if (role === "driver") {
      this.setDriverAvailable();
    }

    return true;
  }

  /**
   * Set driver as available for rides
   */
  setDriverAvailable() {
    if (!this.socket || !this.userId || this.userRole !== "driver") {
      return false;
    }

    this.log(`Setting driver ${this.userId} as available for rides`);

    this.socket.emit("driver_available", {
      driverId: this.userId,
      role: "driver",
      available: true,
      connectionId: this.connectionId,
      timestamp: new Date(),
    });

    return true;
  }

  /**
   * Request a ride
   * @param {Object} rideData - Ride request data
   */
  requestRide(rideData) {
    if (!this.socket || !this.connected) {
      this.error("Cannot request ride: Socket not connected");
      return false;
    }

    if (!rideData || !rideData.passengerId) {
      this.error("Cannot request ride: Invalid ride data");
      return false;
    }

    this.log("Emitting ride_requested event with data:", rideData);
    this.socket.emit("ride_requested", {
      ...rideData,
      connectionId: this.connectionId,
    });
    return true;
  }

  /**
   * Accept a ride request
   * @param {Object} rideData - Data for the ride being accepted
   */
  acceptRide(rideData) {
    if (!this.socket || !this.connected) {
      this.error("Cannot accept ride: Socket not connected");
      return false;
    }

    if (!rideData || !rideData.rideId) {
      this.error("Cannot accept ride: Invalid ride data");
      return false;
    }

    this.log(`Driver accepting ride ${rideData.rideId}`);

    // First update the ride status to 'accepted'
    this.updateRideStatus({
      rideId: rideData.rideId,
      previousStatus: "requested",
      newStatus: "accepted",
      passengerId: rideData.passengerId,
      driverId: rideData.driverId || this.userId,
      updatedBy: "driver",
    });

    // Then emit the specific driver_accepted event with additional data
    this.socket.emit("ride_accepted", {
      ...rideData,
      connectionId: this.connectionId,
      timestamp: new Date(),
    });

    // Join the ride room for real-time updates
    this.joinRideRoom(rideData.rideId);

    return true;
  }

  /**
   * Join a ride room for real-time updates
   * @param {string} rideId - Ride ID to join
   */
  joinRideRoom(rideId) {
    if (!this.socket || !this.connected) {
      this.error("Cannot join ride room: Socket not connected");
      return false;
    }

    if (!rideId) {
      this.error("Cannot join ride room: No ride ID provided");
      return false;
    }

    this.log(`Joining ride room for ride ID: ${rideId}`);
    this.socket.emit("join_ride_room", { rideId });
    return true;
  }

  /**
   * Leave a ride room
   * @param {string} rideId - Ride ID to leave
   */
  leaveRideRoom(rideId) {
    if (!this.socket || !this.connected) {
      this.error("Cannot leave ride room: Socket not connected");
      return false;
    }

    if (!rideId) {
      this.error("Cannot leave ride room: No ride ID provided");
      return false;
    }

    this.log(`Leaving ride room for ride ID: ${rideId}`);
    this.socket.emit("leave_ride_room", { rideId });
    return true;
  }

  /**
   * Update driver location
   * @param {Object} locationData - Location data including ride ID
   */
  updateDriverLocation(locationData) {
    if (!this.socket || !this.connected) {
      this.error("Cannot update driver location: Socket not connected");
      return false;
    }

    if (!locationData || !locationData.rideId) {
      this.error("Cannot update driver location: Missing ride ID");
      return false;
    }

    // Only log occasionally to reduce spam
    if (Math.random() < 0.05) {
      this.log(`Updating driver location for ride ${locationData.rideId}`);
    }

    this.socket.emit("driver_location_update", {
      ...locationData,
      connectionId: this.connectionId,
    });
    return true;
  }

  /**
   * Update ride status
   * @param {Object} statusData - Status update data
   */
  updateRideStatus(statusData) {
    if (!this.socket || !this.connected) {
      this.error("Cannot update ride status: Socket not connected");
      return false;
    }

    if (!statusData || !statusData.rideId) {
      this.error("Cannot update ride status: Invalid data");
      return false;
    }

    this.log(
      `Updating ride ${statusData.rideId} status to: ${statusData.newStatus}`
    );
    this.socket.emit("ride_status_updated", {
      ...statusData,
      connectionId: this.connectionId,
    });
    return true;
  }

  /**
   * Handle sending a message via socket
   * @param {Object} messageData - Message data to send
   */
  sendChatMessage(messageData) {
    if (!this.socket || !this.connected) {
      this.error("Cannot send message: Socket not connected");
      return false;
    }

    if (!messageData || !messageData.rideId) {
      this.error("Cannot send message: Missing ride ID");
      return false;
    }

    this.log(`Sending message to ride ${messageData.rideId}`);

    // Join the chat room if not already joined
    this.joinChatRoom(messageData.rideId);

    // Emit the message event
    this.socket.emit("send_message", {
      ...messageData,
      timestamp: new Date(),
      connectionId: this.connectionId,
    });

    return true;
  }

  /**
   * Join a chat room for a specific ride
   * @param {string} rideId - Ride ID to join chat for
   */
  joinChatRoom(rideId) {
    if (!this.socket || !this.connected) {
      this.error("Cannot join chat room: Socket not connected");
      return false;
    }

    if (!rideId) {
      this.error("Cannot join chat room: No ride ID provided");
      return false;
    }

    this.log(`Joining chat room for ride ID: ${rideId}`);
    this.socket.emit("join_chat_room", { rideId });
    return true;
  }

  /**
   * Leave a chat room for a specific ride
   * @param {string} rideId - Ride ID to leave chat for
   */
  leaveChatRoom(rideId) {
    if (!this.socket || !this.connected) {
      this.error("Cannot leave chat room: Socket not connected");
      return false;
    }

    if (!rideId) {
      this.error("Cannot leave chat room: No ride ID provided");
      return false;
    }

    this.log(`Leaving chat room for ride ID: ${rideId}`);
    this.socket.emit("leave_chat_room", { rideId });
    return true;
  }

  /**
   * Update message status (read, delivered)
   * @param {string} messageId - Message ID to update
   * @param {string} status - New status ('read' or 'delivered')
   * @param {string} rideId - Associated ride ID
   */
  updateMessageStatus(messageId, status, rideId) {
    if (!this.socket || !this.connected) {
      this.error("Cannot update message status: Socket not connected");
      return false;
    }

    if (!messageId || !status) {
      this.error("Cannot update message status: Missing required parameters");
      return false;
    }

    if (!["delivered", "read"].includes(status)) {
      this.error("Invalid message status. Must be 'delivered' or 'read'");
      return false;
    }

    this.log(`Updating message ${messageId} status to ${status}`);
    this.socket.emit("message_status_update", {
      messageId,
      status,
      rideId,
      connectionId: this.connectionId,
    });

    return true;
  }

  /**
   * Mark a message as read
   * @param {Object} data - Message data including messageId, senderId, and rideId
   */
  markMessageRead(data) {
    if (!this.socket || !this.connected) {
      this.error("Cannot mark message as read: Socket not connected");
      return false;
    }

    if (!data.messageId || !data.rideId) {
      this.error("Cannot mark message as read: Missing required parameters");
      return false;
    }

    this.log(`Marking message ${data.messageId} as read`);
    this.socket.emit("message_read", {
      ...data,
      connectionId: this.connectionId,
    });

    return true;
  }

  /**
   * Disconnect the socket
   */
  disconnect() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    if (this.socket) {
      this.log("Manually disconnecting socket");
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.setupComplete = false;
    }
  }

  /**
   * Clear user data on logout
   */
  clearUserData() {
    localStorage.removeItem("tripshare_user_id");
    localStorage.removeItem("tripshare_user_role");
    this.userId = null;
    this.userRole = null;
  }

  /**
   * Get the raw socket instance
   */
  getSocket() {
    return this.socket;
  }

  // Logging helpers
  log(...args) {
    if (this.debugMode) console.log("[SocketService]", ...args);
  }

  error(...args) {
    console.error("[SocketService Error]", ...args);
  }
}

// Create and export a singleton instance
const socketService = new PersistentSocketService();

// Make socketService globally available for components that need it
if (typeof window !== "undefined") {
  window.socketService = socketService;
}

export default socketService;
