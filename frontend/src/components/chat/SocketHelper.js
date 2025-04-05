import socketService from "../services/socketService";

/**
 * Joins a trip's chat room
 * @param {String} tripId - The trip ID to join
 * @param {Object} userData - User data to send to the room
 */
export const joinTripChat = (tripId, userData = {}) => {
  if (!tripId) return;
  socketService.joinRoom(tripId, userData);
};

/**
 * Leaves a trip's chat room
 * @param {String} tripId - The trip ID to leave
 */
export const leaveTripChat = (tripId) => {
  if (!tripId) return;
  socketService.leaveRoom(tripId);
};

/**
 * Emits a typing status event
 * @param {String} tripId - The trip ID
 * @param {Boolean} isTyping - Whether the user is typing
 * @param {Object} userData - User data to send with the event
 */
export const emitTypingStatus = (tripId, isTyping, userData = {}) => {
  if (!tripId) return;
  
  const eventName = isTyping ? "typing_started" : "typing_stopped";
  socketService.emit(eventName, {
    tripId,
    ...userData,
    timestamp: new Date().toISOString()
  });
};

/**
 * Sets up socket event listeners for chat functionality
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} addLocalMessage - Action creator for adding a message
 * @param {Function} removeLocalMessage - Action creator for removing a message
 * @param {Function} updateTypingStatus - Action creator for updating typing status
 */
export const setupChatSocketListeners = (
  dispatch,
  addLocalMessage,
  removeLocalMessage,
  updateTypingStatus
) => {
  socketService.on("new_message", (message) => {
    dispatch(addLocalMessage(message));
  });

  socketService.on("message_deleted", ({ messageId }) => {
    dispatch(removeLocalMessage(messageId));
  });

  socketService.on("typing_started", ({ tripId, userId, userName, timestamp }) => {
    dispatch(updateTypingStatus({ 
      tripId, 
      userId, 
      isTyping: true, 
      timestamp,
      userName 
    }));
  });

  socketService.on("typing_stopped", ({ tripId, userId }) => {
    dispatch(updateTypingStatus({ 
      tripId, 
      userId, 
      isTyping: false 
    }));
  });

  return () => {
    socketService.off("new_message");
    socketService.off("message_deleted");
    socketService.off("typing_started");
    socketService.off("typing_stopped");
  };
};