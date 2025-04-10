import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";

const ChatHeader = ({ tripId }) => {
  const [tripDetails, setTripDetails] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const { typingUsers } = useSelector((state) => state.chat);

  useEffect(() => {
    // Simulating trip details fetch
    setTripDetails({
      id: tripId,
      otherPartyName: "John Doe", // This would be dynamically set based on user role
      lastActive: new Date(),
    });
  }, [tripId]);

  if (!tripDetails) {
    return <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>;
  }

  // Check if someone is typing
  const isTyping = typingUsers[tripId] && Object.keys(typingUsers[tripId]).length > 0;
  const typingUser = isTyping ? Object.keys(typingUsers[tripId])[0] : null;

  return (
    <div className="flex-1">
      <div className="flex items-center">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">
            {tripDetails.otherPartyName}
          </h2>
          <p className="text-sm text-gray-500">
            {isTyping ? (
              <span className="text-green-500">Typing...</span>
            ) : (
              `Last active ${formatDistanceToNow(tripDetails.lastActive, { addSuffix: true })}`
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;