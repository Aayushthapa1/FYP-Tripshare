// Socket service for handling real-time communication
import io from "socket.io-client"

class SocketService {
  socket = null

  // Initialize the socket connection
  connect(url = import.meta.env.VITE_SOCKET_URL || "http://localhost:3301") {
    if (this.socket && this.socket.connected) {
      return this.socket
    }

    this.socket = io(url, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
    })

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id)
    })

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
    })

    return this.socket
  }

  // Disconnect the socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // Join a room
  joinRoom(roomName, userData = {}) {
    if (!this.socket) return
    this.socket.emit("joinRoom", { room: roomName, user: userData })
  }

  // Leave a room
  leaveRoom(roomName) {
    if (!this.socket) return
    this.socket.emit("leaveRoom", { room: roomName })
  }

  // Send a message to the server
  emit(event, data) {
    if (!this.socket) return
    this.socket.emit(event, data)
  }

  // Listen for an event
  on(event, callback) {
    if (!this.socket) return
    this.socket.on(event, callback)
  }

  // Remove an event listener
  off(event, callback) {
    if (!this.socket) return
    this.socket.off(event, callback)
  }

  // Get the socket instance
  getSocket() {
    return this.socket
  }
}

// Create a singleton instance
const socketService = new SocketService()
export default socketService

