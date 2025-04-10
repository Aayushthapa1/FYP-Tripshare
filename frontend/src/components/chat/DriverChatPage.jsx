// src/pages/DriverChatPage.jsx

import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

// Import chat slice actions
import {
  fetchConversations,
  fetchMessages,
  sendChatMessage,
  markMessagesAsRead,
  fetchUnreadCount,
} from "../Slices/chatSlice";

const DriverChatPage = () => {
  const { user: currentUser } = useSelector((state) => state.auth);

  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // We still fetch availablePassengers locally
  const [availablePassengers, setAvailablePassengers] = useState([]);

  // Env config
  const BASE_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3301";

  // Redux data & dispatch
  const dispatch = useDispatch();
  const { conversations, messagesByContact, unreadCount, isLoading, error } =
    useSelector((state) => state.chat);

  // Once we have currentUser, fetch conversations and booked passengers
  useEffect(() => {
    if (currentUser && currentUser._id) {
      dispatch(fetchConversations());
      dispatch(fetchUnreadCount());
      fetchBookedPassengers();
      setLoading(false);

      const convInterval = setInterval(() => {
        dispatch(fetchConversations());
      }, 1000);

      const unreadInterval = setInterval(() => {
        dispatch(fetchUnreadCount());
      }, 1000);

      return () => {
        clearInterval(convInterval);
        clearInterval(unreadInterval);
      };
    }
  }, [currentUser, dispatch]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messagesByContact]);

  // If user selects a contact, fetch messages & mark as read
  useEffect(() => {
    if (selectedContact && currentUser) {
      dispatch(fetchMessages(selectedContact.contactId))
        .unwrap()
        .then(() => {
          dispatch(markMessagesAsRead(selectedContact.contactId));
        })
        .catch((err) => console.error("Error fetching messages:", err));
    }
  }, [selectedContact, currentUser, dispatch]);

  // Fetch booked passengers
  const fetchBookedPassengers = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/bookings/getChatUsers`,
        {
          withCredentials: true,
        }
      );
      if (response.data.IsSuccess) {
        const chatUsers = (response.data.Result.bookedUsers || []).map(
          (user) => ({
            _id: user._id,
            fullName: user.fullName || "User",
            userName: user.userName,
            phoneNumber: user.phoneNumber || "",
            email: user.email || "",
            role: "user",
          })
        );
        setAvailablePassengers(chatUsers);
      }
    } catch (error) {
      console.error("Error fetching available passengers:", error);
    }
  };

  // Get messages for the current selected contact
  const currentMessages = selectedContact
    ? messagesByContact[selectedContact.contactId] || []
    : [];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact || !currentUser) return;

    setSendingMessage(true);
    const messageToSend = newMessage.trim();
    setNewMessage("");

    // Prepare the data for sending
    const messageData = {
      receiverId: selectedContact.contactId,
      content: messageToSend,
      messageType: "text",
      receiverType: "User",
    };

    // Dispatch the thunk
    dispatch(sendChatMessage(messageData))
      .unwrap()
      .catch((err) => {
        console.error("Error sending message:", err);
      })
      .finally(() => {
        setSendingMessage(false);
      });
  };

  const startNewConversation = (passenger) => {
    setSelectedContact({
      contactId: passenger._id,
      contactName: passenger.fullName || passenger.userName || "Passenger",
      contactRole: passenger.role,
      contactPhone: passenger.phoneNumber,
      contactEmail: passenger.email,
      lastMessage: "",
      lastMessageDate: new Date(),
      unreadCount: 0,
    });
    setNewMessage("");
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessageTime = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  const getRandomColor = (id) => {
    const colors = [
      "bg-green-500",
      "bg-purple-500",
      "bg-blue-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500",
    ];
    const hashCode = String(id)
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hashCode % colors.length];
  };

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your chat...</p>
        </div>
      </div>
    );
  }

  const newChatPassengers = availablePassengers.filter(
    (passenger) =>
      !conversations.some((conv) => conv.contactId === passenger._id)
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50">
      {/* Sidebar - Conversations List */}
      <div className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <h2 className="text-xl font-semibold">Messages</h2>
          {unreadCount > 0 && (
            <div className="mt-1 text-sm font-medium text-white opacity-90">
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </div>
          )}
          <div className="text-xs mt-2 opacity-75">Logged in as Driver</div>
        </div>

        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300">
          {/* Current Conversations */}
          {conversations.length > 0 ? (
            <div className="py-2">
              <h3 className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Your Passengers
              </h3>
              {conversations.map((conversation) => (
                <div
                  key={conversation.contactId}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedContact?.contactId === conversation.contactId
                      ? "bg-green-50 border-l-4 border-green-500"
                      : "border-l-4 border-transparent"
                  }`}
                  onClick={() => setSelectedContact(conversation)}
                >
                  <div className="flex items-center">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full ${getRandomColor(
                        conversation.contactId
                      )} flex items-center justify-center text-white font-medium text-sm`}
                    >
                      {getInitials(conversation.contactName)}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conversation.contactName}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {formatMessageTime(conversation.lastMessageDate)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="ml-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : isLoading ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading conversations...</p>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="mt-4 text-gray-700 font-medium">
                No conversations available
              </p>
              <p className="text-sm mt-1 text-gray-500">
                Wait for passengers to book your trips
              </p>
            </div>
          )}

          {/* Available Passengers to Chat With */}
          {newChatPassengers.length > 0 && (
            <div className="py-2">
              <h3 className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booked Passengers
              </h3>
              {newChatPassengers.map((passenger) => (
                <div
                  key={passenger._id}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => startNewConversation(passenger)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full ${getRandomColor(
                          passenger._id
                        )} flex items-center justify-center text-white font-medium text-sm`}
                      >
                        {getInitials(passenger.fullName || passenger.userName)}
                      </div>
                      <div className="ml-3 truncate">
                        <h3 className="font-medium text-gray-900 truncate">
                          {passenger.fullName ||
                            passenger.userName ||
                            "Passenger"}
                        </h3>
                        {passenger.phoneNumber && (
                          <p className="text-xs text-gray-500 truncate">
                            {passenger.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <button className="text-xs px-3 py-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-sm whitespace-nowrap ml-2">
                      Start Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white shadow-sm">
        {/* Chat Header */}
        {selectedContact ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center">
              <div
                className={`w-10 h-10 rounded-full ${getRandomColor(
                  selectedContact.contactId
                )} flex items-center justify-center text-white font-medium text-sm`}
              >
                {getInitials(selectedContact.contactName)}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex items-center">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {selectedContact.contactName}
                  </h2>
                </div>
                {selectedContact.contactPhone && (
                  <p className="text-xs text-gray-500 truncate">
                    {selectedContact.contactPhone}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-300"
            >
              {isLoading && currentMessages.length === 0 ? (
                <div className="text-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-4 text-gray-500">Loading messages...</p>
                </div>
              ) : currentMessages.length === 0 ? (
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <p className="mt-4 text-gray-700 font-medium">
                    No messages yet
                  </p>
                  <p className="text-sm mt-1 text-gray-500">
                    Start the conversation by sending a message
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentMessages.map((message, index) => {
                    const isSender = message.sender === currentUser._id;
                    return (
                      <div
                        key={message._id || index}
                        className={`flex ${
                          isSender ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isSender && (
                          <div
                            className={`flex-shrink-0 h-8 w-8 rounded-full ${getRandomColor(
                              selectedContact.contactId
                            )} flex items-center justify-center text-white text-xs mr-2 self-end`}
                          >
                            {getInitials(selectedContact.contactName)}
                          </div>
                        )}
                        <div className="max-w-[75%]">
                          <div
                            className={`px-4 py-2 rounded-2xl shadow-sm ${
                              isSender
                                ? "bg-green-500 text-white rounded-br-none"
                                : "bg-white text-gray-800 rounded-bl-none"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                          <div
                            className={`text-xs mt-1 ${
                              isSender ? "text-right" : "text-left"
                            } text-gray-500`}
                          >
                            {formatMessageTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-gray-200 bg-white"
            >
              <div className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-l-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={sendingMessage}
                  ref={messageInputRef}
                />
                <button
                  type="submit"
                  className={`bg-green-500 text-white px-5 py-2 rounded-r-full font-medium ${
                    sendingMessage || !newMessage.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-green-600"
                  } transition-colors`}
                  disabled={sendingMessage || !newMessage.trim()}
                >
                  {sendingMessage ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      <span>Sending</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span>Send</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 max-w-md">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Welcome to your messages
              </h3>
              <p className="text-gray-600 mb-6">
                Select a conversation from the sidebar or start a new chat with
                a booked passenger
              </p>
              {newChatPassengers.length > 0 && (
                <p className="text-sm text-green-600">
                  {newChatPassengers.length} passenger
                  {newChatPassengers.length !== 1 ? "s" : ""} available to chat
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverChatPage;
