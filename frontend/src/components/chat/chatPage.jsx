import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import socketService from "../socket/socketService";
import {
  fetchTripMessages,
  sendTextMessage,
  sendImageMessage,
  sendFileMessage,
  deleteMessage,
  markMessagesAsRead,
  setTypingStatus,
  addLocalMessage,
  removeLocalMessage,
  updateTypingStatus,
} from "../Slices/chatSlice";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { messages, isLoading, error, pagination, typingUsers } = useSelector(
    (state) => state.chat
  );
  const { user } = useSelector((state) => state.auth);

  // Initialize socket connection and join chat room
  useEffect(() => {
    // Connect to socket if not already connected
    const socket = socketService.connect();

    // Join the trip's chat room
    if (tripId && user) {
      socketService.joinRoom(tripId, {
        userId: user._id,
        name: user.name,
      });
    }

    // Set up event listeners
    socketService.on("new_message", (message) => {
      dispatch(addLocalMessage(message));
    });

    socketService.on("message_deleted", ({ messageId }) => {
      dispatch(removeLocalMessage(messageId));
    });

    socketService.on(
      "typing_started",
      ({ tripId, userId, userName, timestamp }) => {
        dispatch(
          updateTypingStatus({
            tripId,
            userId,
            isTyping: true,
            timestamp,
            userName,
          })
        );
      }
    );

    socketService.on("typing_stopped", ({ tripId, userId }) => {
      dispatch(
        updateTypingStatus({
          tripId,
          userId,
          isTyping: false,
        })
      );
    });

    // Clean up on unmount
    return () => {
      if (tripId) {
        socketService.leaveRoom(tripId);
      }

      socketService.off("new_message");
      socketService.off("message_deleted");
      socketService.off("typing_started");
      socketService.off("typing_stopped");
    };
  }, [dispatch, tripId, user]);

  // Fetch messages
  useEffect(() => {
    if (tripId) {
      dispatch(fetchTripMessages({ tripId, page: 1, limit: 50 }));
    }
  }, [dispatch, tripId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (messages.length > 0 && user) {
      const unreadMessages = messages.filter(
        (msg) => !msg.read && msg.sender._id !== user._id
      );

      if (unreadMessages.length > 0) {
        dispatch(
          markMessagesAsRead({
            tripId,
            messageIds: unreadMessages.map((msg) => msg._id),
          })
        );
      }
    }
  }, [messages, user, dispatch, tripId]);

  const handleSendMessage = (content) => {
    if (content.trim()) {
      dispatch(sendTextMessage({ tripId, content }));
    }
  };

  const handleSendImage = (imageFile) => {
    dispatch(sendImageMessage({ tripId, imageFile }));
  };

  const handleSendFile = (file) => {
    dispatch(sendFileMessage({ tripId, file }));
  };

  const handleDeleteMessage = (messageId) => {
    dispatch(deleteMessage(messageId));
  };

  const handleTyping = (isTyping) => {
    dispatch(setTypingStatus({ tripId, isTyping }));
  };

  const loadMoreMessages = () => {
    if (pagination.currentPage < pagination.totalPages && !isLoadingMore) {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      dispatch(fetchTripMessages({ tripId, page: nextPage, limit: 50 }))
        .then(() => {
          setPage(nextPage);
          setIsLoadingMore(false);
        })
        .catch(() => {
          setIsLoadingMore(false);
        });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex items-center p-4 bg-white shadow">
        <button
          onClick={() => navigate("/chats")}
          className="mr-2 p-2 rounded-full hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <ChatHeader tripId={tripId} />
      </div>

      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          currentUser={user}
          onDeleteMessage={handleDeleteMessage}
          onLoadMore={loadMoreMessages}
          hasMore={pagination.currentPage < pagination.totalPages}
          isLoading={isLoading}
          typingUsers={typingUsers[tripId] || {}}
          messagesEndRef={messagesEndRef}
        />
      </div>

      <div className="bg-white border-t">
        <MessageInput
          onSendMessage={handleSendMessage}
          onSendImage={handleSendImage}
          onSendFile={handleSendFile}
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
};

export default ChatPage;
