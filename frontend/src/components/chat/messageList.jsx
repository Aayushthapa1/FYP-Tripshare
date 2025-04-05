import React, { useRef } from "react";
import MessageItem from "./MessageItem";

const MessageList = ({
  messages,
  currentUser,
  onDeleteMessage,
  onLoadMore,
  hasMore,
  isLoading,
  typingUsers,
  messagesEndRef,
}) => {
  const listRef = useRef(null);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="h-full overflow-y-auto p-4" ref={listRef}>
      {hasMore && (
        <div className="flex justify-center mb-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </div>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}

      {Object.keys(groupedMessages).map((date) => (
        <div key={date}>
          <div className="flex justify-center my-4">
            <span className="px-3 py-1 bg-gray-200 rounded-full text-xs">
              {date}
            </span>
          </div>
          {groupedMessages[date].map((message) => (
            <MessageItem
              key={message._id}
              message={message}
              isOwnMessage={message.sender._id === currentUser?._id}
              onDelete={() => onDeleteMessage(message._id)}
            />
          ))}
        </div>
      ))}

      {/* Typing indicator */}
      {Object.keys(typingUsers).length > 0 && (
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
          <span className="text-sm text-gray-500">Someone is typing...</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;