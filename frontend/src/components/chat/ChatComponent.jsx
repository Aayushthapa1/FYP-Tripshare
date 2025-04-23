import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  User,
  SendHorizontal,
  Image as ImageIcon,
  Check,
  CheckCheck,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Paperclip,
  X,
  ChevronDown,
  MoreVertical,
  MessageSquare,
} from "lucide-react";

// Enhanced chat component with improved UI and error handling
const ChatComponent = ({
  rideId,
  recipientId,
  userId,
  userName,
  isModal = false,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAutoscrollEnabled, setIsAutoscrollEnabled] = useState(true);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageTimersRef = useRef({});

  const { token } = useSelector((state) => state.auth) || {};
  const MAX_MESSAGE_LENGTH = 1000;

  // Track processed message IDs to prevent duplicates
  const processedMessageIds = useRef(new Set());

  // Store messages in a map keyed by message ID for easy deduplication
  const [messagesMap, setMessagesMap] = useState(new Map());
  const [failedMessages, setFailedMessages] = useState(new Set());

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date for message groups
  const formatMessageDate = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  // Handle scrolling
  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    setShowScrollButton(!isNearBottom);
    setIsAutoscrollEnabled(isNearBottom);
  }, []);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
      setShowScrollButton(false);
      setHasNewMessages(false);
    }
  }, []);

  // Initial welcome message
  useEffect(() => {
    const welcomeId = `welcome_${rideId}`;
    if (!processedMessageIds.current.has(welcomeId)) {
      processedMessageIds.current.add(welcomeId);
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(welcomeId, {
          _id: welcomeId,
          sender: recipientId,
          content:
            "Welcome! You can send messages here. Messages will appear instantly.",
          timestamp: new Date(),
          status: "delivered",
        });
        return newMap;
      });
    }
  }, [rideId, recipientId]);

  // Setup chat container scroll listener
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Set up socket listeners for new messages and connection status
  useEffect(() => {
    // Get the socket service
    const socketService =
      window.socketService || (window.parent && window.parent.socketService);

    if (!socketService || !socketService.socket || !rideId) {
      setIsConnected(false);
      return;
    }

    // Handle new messages
    const handleNewMessage = (data) => {
      if (data.rideId !== rideId) return;

      // Skip if we've already processed this message
      if (!data._id || processedMessageIds.current.has(data._id)) return;

      console.log("New message received:", data);

      // Mark as processed
      processedMessageIds.current.add(data._id);

      // Add to messages map
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(data._id, {
          ...data,
          status: "delivered",
        });
        return newMap;
      });

      // Show new message indicator if not at bottom
      if (!isAutoscrollEnabled) {
        setHasNewMessages(true);
      } else {
        scrollToBottom();
      }

      // If the message is from the other person, mark their typing status as false
      if (data.sender !== userId) {
        // Send read receipt to acknowledge we've seen the message
        try {
          socketService.socket.emit("message_read", {
            rideId,
            messageIds: [data._id],
            readerId: userId,
          });
        } catch (err) {
          console.error("Error sending read receipt:", err);
        }

        setTypingUsers((prev) => ({
          ...prev,
          [data.sender]: false,
        }));
      }
    };

    // Handle typing status
    const handleTypingStarted = (data) => {
      if (data.rideId !== rideId || data.userId === userId) return;

      setTypingUsers((prev) => ({
        ...prev,
        [data.userId]: {
          isTyping: true,
          name: data.userName || "Someone",
          timestamp: data.timestamp,
        },
      }));
    };

    const handleTypingStopped = (data) => {
      if (data.rideId !== rideId || data.userId === userId) return;

      setTypingUsers((prev) => ({
        ...prev,
        [data.userId]: false,
      }));
    };

    // Handle connection events
    const handleConnect = () => {
      setIsConnected(true);
      setErrorMessage(null);

      // Join chat room
      console.log("Joining chat room:", rideId);
      socketService.socket.emit("join_chat_room", { rideId });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setErrorMessage("Connection lost. Reconnecting...");
    };

    const handleConnectError = (error) => {
      setIsConnected(false);
      setErrorMessage(`Connection error: ${error.message || "Unknown error"}`);
    };

    // Enhanced message acknowledgment
    const handleMessageAck = (data) => {
      console.log("Message acknowledgement received:", data);
      if (data.messageId) {
        // Update message status even if not in map yet (handles race conditions)
        setMessagesMap((prev) => {
          const newMap = new Map(prev);
          const message = newMap.get(data.messageId);

          if (message) {
            newMap.set(data.messageId, {
              ...message,
              status: "sent", // First status after sending
            });

            // Remove from failed messages if it was there
            if (failedMessages.has(data.messageId)) {
              setFailedMessages((prev) => {
                const newSet = new Set(prev);
                newSet.delete(data.messageId);
                return newSet;
              });
            }
          }

          return newMap;
        });
      }
    };

    // Handle message delivered status
    const handleMessageDelivered = (data) => {
      console.log("Message delivered:", data);
      if (data.messageId) {
        setMessagesMap((prev) => {
          const newMap = new Map(prev);
          const message = newMap.get(data.messageId);

          if (message) {
            newMap.set(data.messageId, {
              ...message,
              status: "delivered",
            });

            // Remove from failed messages if it was there
            if (failedMessages.has(data.messageId)) {
              setFailedMessages((prev) => {
                const newSet = new Set(prev);
                newSet.delete(data.messageId);
                return newSet;
              });
            }
          }

          return newMap;
        });
      }
    };

    // Handle message read status
    const handleMessageRead = (data) => {
      console.log("Messages read:", data);
      if (data.messageIds && data.rideId === rideId) {
        setMessagesMap((prev) => {
          const newMap = new Map(prev);
          data.messageIds.forEach((msgId) => {
            if (newMap.has(msgId)) {
              const message = newMap.get(msgId);
              newMap.set(msgId, {
                ...message,
                status: "read",
              });

              // Remove from failed messages if it was there
              if (failedMessages.has(msgId)) {
                setFailedMessages((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(msgId);
                  return newSet;
                });
              }
            }
          });
          return newMap;
        });
      }
    };

    // Set initial connection status
    setIsConnected(socketService.socket.connected);

    // Join chat room if already connected
    if (socketService.socket.connected) {
      socketService.socket.emit("join_chat_room", { rideId });
    }

    // Register event listeners
    socketService.socket.on("connect", handleConnect);
    socketService.socket.on("disconnect", handleDisconnect);
    socketService.socket.on("connect_error", handleConnectError);
    socketService.socket.on("new_message", handleNewMessage);
    socketService.socket.on("message_acknowledgement", handleMessageAck);
    socketService.socket.on("message_delivered", handleMessageDelivered); // Add this new event listener
    socketService.socket.on("messages_read", handleMessageRead);
    socketService.socket.on("typing_started", handleTypingStarted);
    socketService.socket.on("typing_stopped", handleTypingStopped);

    // Cleanup
    return () => {
      if (socketService && socketService.socket) {
        socketService.socket.off("connect", handleConnect);
        socketService.socket.off("disconnect", handleDisconnect);
        socketService.socket.off("connect_error", handleConnectError);
        socketService.socket.off("new_message", handleNewMessage);
        socketService.socket.off("message_acknowledgement", handleMessageAck);
        socketService.socket.off("message_delivered", handleMessageDelivered);
        socketService.socket.off("messages_read", handleMessageRead);
        socketService.socket.off("typing_started", handleTypingStarted);
        socketService.socket.off("typing_stopped", handleTypingStopped);

        // Leave chat room
        socketService.socket.emit("leave_chat_room", { rideId });
      }

      // Clear all message timers
      Object.values(messageTimersRef.current).forEach((timerId) => {
        if (timerId) clearTimeout(timerId);
      });
      messageTimersRef.current = {};
    };
  }, [rideId, userId, isAutoscrollEnabled, scrollToBottom, failedMessages]);

  // Auto-scroll to bottom initially
  useEffect(() => {
    if (isAutoscrollEnabled) {
      scrollToBottom("auto");
    }
  }, [isAutoscrollEnabled, scrollToBottom]);

  // Send typing status
  const sendTypingStatus = useCallback(
    (isTyping) => {
      const socketService =
        window.socketService || (window.parent && window.parent.socketService);

      if (!socketService || !socketService.socket || !isConnected) return;

      const eventName = isTyping ? "typing_started" : "typing_stopped";
      socketService.socket.emit(eventName, {
        rideId,
        userId,
        userName,
        timestamp: new Date().toISOString(),
      });
    },
    [rideId, userId, userName, isConnected]
  );

  // Handle input change with debounced typing indicator
  const handleInputChange = useCallback(
    (e) => {
      const newValue = e.target.value;
      setNewMessage(newValue);

      // Handle typing status with debounce
      if (newValue && !isTyping) {
        setIsTyping(true);
        sendTypingStatus(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          sendTypingStatus(false);
        }
      }, 2000);
    },
    [isTyping, sendTypingStatus]
  );

  // Enhanced retry handling for failed messages
  const handleRetryMessage = useCallback(
    (messageId) => {
      console.log("Retrying message:", messageId);
      const message = messagesMap.get(messageId);
      if (!message) {
        console.error("Message not found for retry:", messageId);
        return;
      }

      // Get socket service with better availability check
      const socketService =
        window.socketService || (window.parent && window.parent.socketService);

      if (!socketService) {
        setErrorMessage("Socket service not available");
        return;
      }

      // Check socket connection with retry capability
      if (!socketService.socket || !socketService.socket.connected) {
        // Attempt to reconnect socket if disconnected
        if (!socketService.connected) {
          console.log(
            "Socket disconnected, attempting to reconnect before retry..."
          );
          try {
            socketService.connect();
          } catch (err) {
            console.error("Failed to reconnect socket for retry:", err);
          }
        }

        if (!socketService.socket || !socketService.socket.connected) {
          setErrorMessage("Cannot retry message: No connection");
          return;
        }
      }

      // Remove from failed messages
      setFailedMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });

      // Update message status to sending
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(messageId, {
          ...message,
          status: "sending",
          timestamp: new Date(), // Update timestamp for retry
        });
        return newMap;
      });

      // Show sending indicator briefly
      setSending(true);
      setTimeout(() => setSending(false), 300);

      // Retry sending the message with acknowledgment callback
      console.log("Resending message:", message);
      socketService.socket.emit(
        "send_message",
        {
          ...message,
          status: "sending", // Reset status
          timestamp: new Date(), // Update timestamp
        },
        (ackResponse) => {
          console.log("Retry acknowledgment received:", ackResponse);

          if (ackResponse && ackResponse.success) {
            // Server acknowledged message receipt
            setMessagesMap((prev) => {
              const newMap = new Map(prev);
              const currentMsg = newMap.get(messageId);
              if (currentMsg) {
                newMap.set(messageId, {
                  ...currentMsg,
                  status: "sent", // Update to "sent" since server received it
                });
              }
              return newMap;
            });
          } else {
            // Server returned error again
            console.error("Server returned error on retry:", ackResponse);
            // Mark as failed again
            setMessagesMap((prev) => {
              const newMap = new Map(prev);
              const currentMsg = newMap.get(messageId);
              if (currentMsg) {
                newMap.set(messageId, {
                  ...currentMsg,
                  status: "failed",
                });
              }
              return newMap;
            });

            setFailedMessages((prev) => {
              const newSet = new Set(prev);
              newSet.add(messageId);
              return newSet;
            });

            setErrorMessage("Failed to send message. Please try again later.");
            setTimeout(() => setErrorMessage(null), 3000);
          }
        }
      );

      // Set fallback timeout for retry as well
      const retryTimerId = setTimeout(() => {
        // If message status is still "sending" after timeout, mark as failed again
        setMessagesMap((prev) => {
          const current = prev.get(messageId);
          if (current && current.status === "sending") {
            console.log("Retry timed out, marking as failed again:", messageId);
            const newMap = new Map(prev);
            newMap.set(messageId, {
              ...current,
              status: "failed",
            });

            // Add to failed messages again
            setFailedMessages((prevFailed) => {
              const newSet = new Set(prevFailed);
              newSet.add(messageId);
              return newSet;
            });

            return newMap;
          }
          return prev;
        });
      }, 8000);

      // Store timer ID for cleanup
      messageTimersRef.current[messageId] = retryTimerId;
    },
    [messagesMap]
  );

  // Enhanced send message function with better error handling and acknowledgment
  const handleSendMessage = useCallback(
    (e) => {
      e.preventDefault();
      const trimmedMessage = newMessage.trim();
      if (!trimmedMessage || sending) return;

      if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
        setErrorMessage(
          `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`
        );
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }

      // Get socket service with better availability check
      const socketService =
        window.socketService || (window.parent && window.parent.socketService);

      if (!socketService) {
        setErrorMessage("Socket service not available");
        return;
      }

      // Check socket connection with retry capability
      if (!socketService.socket || !socketService.socket.connected) {
        // Attempt to reconnect socket if disconnected
        if (!socketService.connected) {
          console.log("Socket disconnected, attempting to reconnect...");
          try {
            socketService.connect();
          } catch (err) {
            console.error("Failed to reconnect socket:", err);
          }
        }

        if (!socketService.socket || !socketService.socket.connected) {
          setErrorMessage("Cannot send message: No connection");
          return;
        }
      }

      const messageId = `msg_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const messageData = {
        _id: messageId,
        rideId,
        sender: userId,
        senderName: userName,
        recipient: recipientId,
        content: trimmedMessage,
        timestamp: new Date(),
        status: "sending",
      };

      try {
        // Set sending state and clear input immediately
        setSending(true);
        setNewMessage("");
        inputRef.current?.focus();

        // Process message locally first (optimistic update)
        if (!processedMessageIds.current.has(messageId)) {
          processedMessageIds.current.add(messageId);
          setMessagesMap((prev) => {
            const newMap = new Map(prev);
            newMap.set(messageId, messageData);
            return newMap;
          });
        }

        // Stop typing indicator
        setIsTyping(false);
        sendTypingStatus(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Scroll to bottom immediately
        scrollToBottom();

        // Emit event with clear error handling
        console.log("Sending message with ID:", messageId);

        // Send with short delay to show sending animation
        setTimeout(() => {
          socketService.socket.emit(
            "send_message",
            messageData,
            (ackResponse) => {
              // This is a socket.io acknowledgment callback
              console.log("Message send acknowledgment:", ackResponse);

              if (ackResponse && ackResponse.success) {
                // Server acknowledged message receipt
                setMessagesMap((prev) => {
                  const newMap = new Map(prev);
                  const message = newMap.get(messageId);
                  if (message) {
                    newMap.set(messageId, {
                      ...message,
                      status: "sent", // Update to "sent" since server received it
                    });
                  }
                  return newMap;
                });
              } else {
                // Server returned error
                console.error(
                  "Server returned error on message send:",
                  ackResponse
                );
                // Mark as failed after acknowledgment came back negative
                setMessagesMap((prev) => {
                  const newMap = new Map(prev);
                  const message = newMap.get(messageId);
                  if (message) {
                    newMap.set(messageId, {
                      ...message,
                      status: "failed",
                    });
                  }
                  return newMap;
                });

                setFailedMessages((prev) => {
                  const newSet = new Set(prev);
                  newSet.add(messageId);
                  return newSet;
                });

                setErrorMessage("Failed to send message. Please try again.");
                setTimeout(() => setErrorMessage(null), 3000);
              }
            }
          );

          // End sending state after a short delay
          setTimeout(() => {
            setSending(false);
          }, 300);
        }, 200);

        // Set fallback timeout for message delivery confirmation
        const sendTimerId = setTimeout(() => {
          // If message status is still "sending" after timeout, mark as failed
          setMessagesMap((prev) => {
            const current = prev.get(messageId);
            if (current && current.status === "sending") {
              console.log("Message timed out, marking as failed:", messageId);
              const newMap = new Map(prev);
              newMap.set(messageId, {
                ...current,
                status: "failed",
              });

              // Add to failed messages
              setFailedMessages((prevFailed) => {
                const newSet = new Set(prevFailed);
                newSet.add(messageId);
                return newSet;
              });

              return newMap;
            }
            return prev;
          });

          // Ensure sending state is cleared after timeout
          setSending(false);
        }, 8000); // Extended timeout for slower connections

        // Store timer ID for cleanup
        messageTimersRef.current[messageId] = sendTimerId;
      } catch (err) {
        console.error("Error sending message:", err);
        setErrorMessage(
          `Failed to send message: ${err.message || "Unknown error"}`
        );

        // Mark message as failed
        setMessagesMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(messageId, {
            ...messageData,
            status: "failed",
          });
          return newMap;
        });

        setFailedMessages((prev) => {
          const newSet = new Set(prev);
          newSet.add(messageId);
          return newSet;
        });

        // End sending state
        setSending(false);
      }
    },
    [
      newMessage,
      sending,
      rideId,
      userId,
      userName,
      recipientId,
      scrollToBottom,
      sendTypingStatus,
    ]
  );

  // NOTE: Fixed ordering - sortedMessages must be defined before groupedMessages
  // Sort messages by timestamp
  const sortedMessages = Array.from(messagesMap.values()).sort((a, b) => {
    const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
    const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
    return timeA - timeB;
  });

  // Group messages by date
  const groupedMessages = sortedMessages.reduce((groups, message) => {
    const date = formatMessageDate(message.timestamp || message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // Check if anyone is typing
  const anyoneTyping = Object.values(typingUsers).some(
    (status) => status && status.isTyping
  );

  // Render typing indicator
  const renderTypingIndicator = () => {
    const typingUsersArray = Object.entries(typingUsers)
      .filter(([, status]) => status && status.isTyping)
      .map(([, status]) => status.name);

    if (typingUsersArray.length === 0) return null;

    let typingText = "";
    if (typingUsersArray.length === 1) {
      typingText = `${typingUsersArray[0]} is typing...`;
    } else if (typingUsersArray.length === 2) {
      typingText = `${typingUsersArray[0]} and ${typingUsersArray[1]} are typing...`;
    } else {
      typingText = "Multiple people are typing...";
    }

    return (
      <div className="text-xs text-gray-500 italic px-4 py-1">
        <div className="flex items-center">
          <div className="typing-animation mr-2">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          {typingText}
        </div>
      </div>
    );
  };

  // Enhanced renderMessageStatus function for better visual feedback and consistency
  const renderMessageStatus = (status) => {
    switch (status) {
      case "sending":
        return (
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full border-2 border-blue-300 border-t-transparent animate-spin mr-1"></div>
            <span className="text-xs text-blue-200">Sending</span>
          </div>
        );
      case "sent":
        return (
          <div className="flex items-center">
            <Check className="w-3 h-3 text-gray-400 mr-1" />
            <span className="text-xs text-blue-200">Sent</span>
          </div>
        );
      case "delivered":
        return (
          <div className="flex items-center">
            <Check className="w-3 h-3 text-blue-300 mr-1" />
            <span className="text-xs text-blue-200">Delivered</span>
          </div>
        );
      case "read":
        return (
          <div className="flex items-center">
            <CheckCheck className="w-3 h-3 text-blue-300 mr-1" />
            <span className="text-xs text-blue-200">Read</span>
          </div>
        );
      case "failed":
        return (
          <div className="flex items-center text-red-300">
            <AlertCircle className="w-3 h-3 mr-1" />
            <span className="text-xs">Failed</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex flex-col ${
        isModal
          ? "h-full"
          : "h-full bg-gray-50 rounded-lg shadow-sm border border-gray-200"
      }`}
    >
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
            <User className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">Chat</h3>
            <div className="flex items-center">
              {isConnected ? (
                <span className="text-xs text-green-600 flex items-center">
                  <Wifi className="w-3 h-3 mr-1" />
                  Connected
                </span>
              ) : (
                <span className="text-xs text-orange-500 flex items-center">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Reconnecting...
                </span>
              )}
            </div>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Error message display */}
      {errorMessage && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-red-600 text-sm flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:bg-red-100 p-1 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Messages container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        onScroll={handleScroll}
      >
        {/* Message groups by date */}
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date} className="space-y-3">
            {/* Date divider */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-200 px-3 py-1 rounded-full text-xs text-gray-600 font-medium">
                {date}
              </div>
            </div>

            {/* Messages */}
            {messages.map((message) => {
              const isSentByMe = message.sender === userId;
              const isFailed = failedMessages.has(message._id);

              return (
                <div
                  key={message._id}
                  className={`flex mb-3 ${
                    isSentByMe ? "justify-end" : "justify-start"
                  } group`}
                >
                  {/* Avatar for messages not sent by me */}
                  {!isSentByMe && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`max-w-xs sm:max-w-sm ${
                      isSentByMe
                        ? "bg-blue-500 text-white rounded-t-lg rounded-bl-lg"
                        : "bg-white border border-gray-200 text-gray-800 rounded-t-lg rounded-br-lg"
                    } px-4 py-3 shadow-sm relative transition-all ${
                      isFailed ? "opacity-70" : ""
                    }`}
                  >
                    {/* Message content */}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>

                    {/* Failed message indicator and retry button */}
                    {isFailed && (
                      <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 -translate-x-full">
                        <button
                          onClick={() => handleRetryMessage(message._id)}
                          className="p-1 bg-white rounded-full border border-red-300 shadow-sm"
                          title="Retry sending"
                        >
                          <RefreshCw className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    )}

                    {/* Time and status */}
                    <div
                      className={`text-xs mt-1 flex items-center ${
                        isSentByMe
                          ? "text-blue-200 justify-end"
                          : "text-gray-500"
                      } space-x-1`}
                    >
                      <span>
                        {formatTime(message.timestamp || message.createdAt)}
                      </span>
                      {isSentByMe && (
                        <span className="ml-1">
                          {renderMessageStatus(message.status)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />

        {/* Typing indicator */}
        {anyoneTyping && renderTypingIndicator()}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <div className="absolute bottom-20 right-6 z-10">
          <button
            onClick={() => scrollToBottom()}
            className="bg-blue-500 text-white p-2 rounded-full shadow-md flex items-center justify-center hover:bg-blue-600 transition-colors relative"
          >
            <ChevronDown className="w-5 h-5" />
            {hasNewMessages && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSendMessage} className="mt-auto">
        {/* Character counter */}
        {newMessage.length > 0 && (
          <div
            className={`text-xs px-4 py-1 text-right ${
              newMessage.length > MAX_MESSAGE_LENGTH
                ? "text-red-500 font-medium"
                : "text-gray-500"
            }`}
          >
            {newMessage.length}/{MAX_MESSAGE_LENGTH}
          </div>
        )}

        <div className="flex items-center p-3 bg-white border-t border-gray-200 rounded-b-lg">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder={sending ? "Sending message..." : "Type a message..."}
              className={`w-full border ${
                newMessage.length > MAX_MESSAGE_LENGTH
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              } rounded-lg px-3 py-2 focus:outline-none focus:ring-2 resize-none max-h-24 pr-10`}
              disabled={sending || !isConnected}
              maxLength={MAX_MESSAGE_LENGTH + 10}
              rows={1}
            />
            <div className="absolute bottom-2 right-2 flex space-x-1 text-gray-400">
              <button
                type="button"
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                disabled={!isConnected || sending}
                title="Attach a file"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={
              !newMessage.trim() ||
              sending ||
              !isConnected ||
              newMessage.length > MAX_MESSAGE_LENGTH
            }
            className={`ml-2 p-2 rounded-full ${
              !newMessage.trim() ||
              !isConnected ||
              newMessage.length > MAX_MESSAGE_LENGTH
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : sending
                ? "bg-blue-400 text-white cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } transition-colors flex-shrink-0 relative`}
          >
            {sending ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <SendHorizontal className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {/* CSS for special elements like typing animation */}
      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(203, 213, 225, 0.5);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: rgba(203, 213, 225, 0.8);
        }

        .typing-animation {
          display: flex;
          align-items: center;
        }

        .typing-animation .dot {
          display: inline-block;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          margin-right: 3px;
          background: #9ca3af;
          animation: typing 1.4s infinite ease-in-out both;
        }

        .typing-animation .dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-animation .dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes typing {
          0%,
          80%,
          100% {
            transform: scale(0.7);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatComponent;
