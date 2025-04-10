import React, { useState } from "react";
import { format } from "date-fns";

const MessageItem = ({ message, isOwnMessage, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleDownload = (url, fileName) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "text":
        return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
      
      case "image":
        return (
          <div className="relative">
            <img
              src={message.mediaUrl || "/placeholder.svg"}
              alt="Shared image"
              className="max-w-xs rounded-lg cursor-pointer"
              onClick={() => window.open(message.mediaUrl, "_blank")}
            />
            <div className="mt-1 text-xs text-gray-500">
              {message.fileName}
            </div>
          </div>
        );
      
      case "file":
        return (
          <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{message.fileName}</p>
              <p className="text-xs text-gray-500">
                {(message.mediaSize / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => handleDownload(message.mediaUrl, message.fileName)}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        );
      
      default:
        return <p>Unsupported message type</p>;
    }
  };

  return (
    <div
      className={`flex mb-4 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div
        className={`relative max-w-[80%] md:max-w-[60%] ${
          isOwnMessage
            ? "bg-blue-500 text-white rounded-tl-lg rounded-tr-sm rounded-bl-lg rounded-br-lg"
            : "bg-white text-gray-800 rounded-tl-sm rounded-tr-lg rounded-bl-lg rounded-br-lg border"
        } p-3 shadow`}
      >
        {renderMessageContent()}
        
        <div className="flex items-center justify-end mt-1 space-x-1">
          <span className="text-xs opacity-70">
            {format(new Date(message.createdAt), "h:mm a")}
          </span>
          
          {isOwnMessage && (
            <span className="text-xs">
              {message.read ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </span>
          )}
        </div>

        {isOwnMessage && showOptions && (
          <div className="absolute top-2 left-0 transform -translate-x-8">
            <div className="relative">
              <button 
                onClick={onDelete}
                className="p-1 rounded-full hover:bg-gray-200 text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;