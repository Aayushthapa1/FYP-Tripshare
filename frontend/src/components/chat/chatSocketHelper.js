import {
  addLocalMessage,
  updateTypingStatus,
  removeLocalMessage
} from "../Slices/chatSlice";


export const setupChatSocketListeners = (socket, dispatch) => {
  if (!socket) return;

  // New message received
  socket.on("new_message", (message) => {
    dispatch(addLocalMessage(message));
  });

  // Message deleted
  socket.on("message_deleted", ({ messageId }) => {
    dispatch(removeLocalMessage(messageId));
  });

  // Messages read
  socket.on("messages_read", ({ tripId, messageIds, userId }) => {
    // This would be handled by the markMessagesAsRead thunk
    // You could dispatch a custom action here if needed
  });

  // Typing indicators
  socket.on("typing_started", ({ tripId, userId, userName, timestamp }) => {
    dispatch(updateTypingStatus({
      tripId,
      userId,
      isTyping: true,
      timestamp,
      userName
    }));
  });

  socket.on("typing_stopped", ({ tripId, userId }) => {
    dispatch(updateTypingStatus({
      tripId,
      userId,
      isTyping: false
    }));
  });

  return () => {
    socket.off("new_message");
    socket.off("message_deleted");
    socket.off("messages_read");
    socket.off("typing_started");
    socket.off("typing_stopped");
  };
};

/**
 * Joins a trip's chat room
 * @param {Object} socket - The socket.io client instance
 * @param {String} tripId - The trip ID to join
 */
export const joinTripChat = (socket, tripId) => {
  if (!socket || !tripId) return;
  socket.emit("join_room", { room: tripId });
};

/**
 * Leaves a trip's chat room
 * @param {Object} socket - The socket.io client instance
 * @param {String} tripId - The trip ID to leave
 */
export const leaveTripChat = (socket, tripId) => {
  if (!socket || !tripId) return;
  socket.emit("leave_room", { room: tripId });
};