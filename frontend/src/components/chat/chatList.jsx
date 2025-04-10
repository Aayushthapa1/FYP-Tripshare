import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchUnreadCount } from "../Slices/chatSlice";
import { formatDistanceToNow } from "date-fns";

import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

const ChatList = () => {
  const dispatch = useDispatch();
  const { unreadCount } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUnreadCount());
  }, [dispatch]);

  return (
    <>
    <Navbar />
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Conversations</h1>
      
      {unreadCount.tripBreakdown && unreadCount.tripBreakdown.length > 0 ? (
        <div className="space-y-4">
          {unreadCount.tripBreakdown.map((trip) => (
            <Link
              key={trip._id}
              to={`/chats/${trip._id}`}
              className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">Trip #{trip._id.substring(0, 8)}</h3>
                  <p className="text-gray-500 text-sm">
                    Last message: {formatDistanceToNow(new Date(trip.lastMessage), { addSuffix: true })}
                  </p>
                </div>
                {trip.count > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    {trip.count}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No active conversations found.</p>
        </div>
      )}
    </div>
    <Footer />
    </>
  );
};
    
export default ChatList;