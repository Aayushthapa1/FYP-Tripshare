import io from "socket.io-client";

class SocketService {
  socket = null;

  connect({
    url = import.meta.env.VITE_SOCKET_URL || "http://localhost:3301",
    userId,
  } = {}) {
    if (this.socket && this.socket.connected) {
      return Promise.resolve(this.socket);
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    return new Promise((resolve, reject) => {
      this.socket = io(url, {
        transports: ["websocket"],
        withCredentials: true,
        query: { userId },
      });

      this.socket.on("connect", () => {
        console.log("Socket connected:", this.socket.id);
        resolve(this.socket);
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        reject(error);
      });

      this.socket.on("disconnect", (reason) => {
        console.warn("Socket disconnected:", reason);
      });
    });
  }

  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket && this.socket.connected;
  }

  getSocket() {
    return this.socket;
  }
}

const socketService = new SocketService();
export default socketService;
