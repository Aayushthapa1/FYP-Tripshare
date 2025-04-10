import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { User, SendHorizontal, Image as ImageIcon } from "lucide-react";

// Completely rewritten chat component to fix duplication issues
const FixedChatComponent = ({ rideId, recipientId, userId, userName }) => {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { token } = useSelector((state) => state.auth) || {};

  // Track processed message IDs to prevent duplicates
  const processedMessageIds = useRef(new Set());

  // Store messages in a map keyed by message ID for easy deduplication
  const [messagesMap, setMessagesMap] = useState(new Map());

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Initial welcome message
  useEffect(() => {
    const welcomeId = `welcome_${rideId}`;
    if (!processedMessageIds.current.has(welcomeId)) {
      processedMessageIds.current.add(welcomeId);
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(welcomeId, {
          _id: welcomeId,
          sender: recipientId, // From the other person
          content:
            "Welcome! You can send messages here. Messages will appear instantly.",
          timestamp: new Date(),
        });
        return newMap;
      });
    }
  }, [rideId, recipientId]);

  // Set up socket listeners for new messages
  useEffect(() => {
    // Get the global socket service
    const socketService =
      window.socketService || (window.parent && window.parent.socketService);

    if (!socketService || !socketService.socket || !rideId) return;

    const handleNewMessage = (data) => {
      if (data.rideId !== rideId) return;

      // Skip if we've already processed this message
      if (!data._id || processedMessageIds.current.has(data._id)) return;

      // Mark as processed
      processedMessageIds.current.add(data._id);

      // Add to messages map
      setMessagesMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(data._id, data);
        return newMap;
      });

      // Scroll to bottom
      scrollToBottom();
    };

    // Join chat room
    console.log("Joining chat room:", rideId);
    socketService.socket.emit("join_chat_room", { rideId });

    // Listen for new messages
    socketService.socket.on("new_message", handleNewMessage);

    // Cleanup
    return () => {
      socketService.socket.off("new_message", handleNewMessage);
      socketService.socket.emit("leave_chat_room", { rideId });
    };
  }, [rideId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messagesMap]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const socketService =
      window.socketService || (window.parent && window.parent.socketService);
    if (!socketService || !socketService.socket) {
      console.error("Socket service not available");
      return;
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
      content: newMessage.trim(),
      timestamp: new Date(),
    };

    try {
      setSending(true);

      // Process message locally first (optimistic update)
      if (!processedMessageIds.current.has(messageId)) {
        processedMessageIds.current.add(messageId);
        setMessagesMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(messageId, messageData);
          return newMap;
        });
      }

      // Clear input and focus
      setNewMessage("");
      inputRef.current?.focus();

      // Send through socket
      socketService.socket.emit("send_message", messageData);

      // Also try to save via API (if token exists)
      if (token) {
        try {
          // API call would go here if needed
          console.log("Message sent:", messageData);
        } catch (err) {
          console.error("API error:", err);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  // Sort messages by timestamp
  const sortedMessages = Array.from(messagesMap.values()).sort((a, b) => {
    const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
    const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
    return timeA - timeB;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {sortedMessages.map((message) => {
          const isSentByMe = message.sender === userId;

          return (
            <div
              key={message._id}
              className={`flex mb-3 ${
                isSentByMe ? "justify-end" : "justify-start"
              }`}
            >
              {!isSentByMe && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}

              <div
                className={`max-w-xs sm:max-w-sm ${
                  isSentByMe
                    ? "bg-blue-500 text-white rounded-t-lg rounded-bl-lg"
                    : "bg-gray-100 text-gray-800 rounded-t-lg rounded-br-lg"
                } px-4 py-2 shadow-sm`}
              >
                <p className="text-sm">{message.content}</p>
                <div
                  className={`text-xs mt-1 flex items-center ${
                    isSentByMe ? "text-blue-200 justify-end" : "text-gray-500"
                  }`}
                >
                  <span>
                    {formatTime(message.timestamp || message.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="mt-auto">
        <div className="flex items-center p-3 bg-white">
          <input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-24"
            disabled={sending}
          />

          <button
            type="submit"
            className={`ml-2 p-2 rounded-full ${
              !newMessage.trim() || sending
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={!newMessage.trim() || sending}
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default FixedChatComponent;
