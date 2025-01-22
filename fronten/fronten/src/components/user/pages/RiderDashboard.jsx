// src/components/user/pages/RiderDashboard.jsx

import React from "react";

function RiderDashboard() {
  // Mock data
  const rideRequest = {
    passengerName: "John Smith",
    pickup: "123 Main Street, New York, NY",
    dropoff: "456 Broadway, New York, NY",
    fare: 30.4,
    distance: "5.2 mi",
    time: "20 mins",
  };

  const handleAccept = () => {
    alert("Ride Accepted!");
  };

  const handleDecline = () => {
    alert("Ride Declined!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Driver Dashboard</h1>

        {/* Current Ride Request */}
        <div className="bg-white shadow-md rounded p-4 md:p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Incoming Ride Request</h2>
          <p className="text-gray-600 mb-2">
            <strong>Passenger:</strong> {rideRequest.passengerName}
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Pickup:</strong> {rideRequest.pickup}
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Dropoff:</strong> {rideRequest.dropoff}
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Distance:</strong> {rideRequest.distance}
          </p>
          <p className="text-gray-600 mb-2">
            <strong>Time Estimate:</strong> {rideRequest.time}
          </p>
          <p className="text-gray-600 mb-4">
            <strong>Fare:</strong> ${rideRequest.fare.toFixed(2)}
          </p>

          <div className="flex space-x-4">
            <button
              onClick={handleAccept}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Accept
            </button>
            <button
              onClick={handleDecline}
              className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200"
            >
              Decline
            </button>
          </div>
        </div>

        {/* Map / route overview */}
        <div className="bg-white shadow-md rounded p-4 md:p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Map View</h2>
          <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400">
            Map Placeholder
          </div>
        </div>

        {/* Past rides or current ride status, etc. */}
        <div className="bg-white shadow-md rounded p-4 md:p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Recent Trips</h2>
          <ul className="space-y-2">
            <li className="flex items-center justify-between text-gray-600">
              <span>Trip #1: 5 miles, $25.50</span>
              <span className="text-green-600">Completed</span>
            </li>
            <li className="flex items-center justify-between text-gray-600">
              <span>Trip #2: 8 miles, $42.00</span>
              <span className="text-green-600">Completed</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default RiderDashboard;
