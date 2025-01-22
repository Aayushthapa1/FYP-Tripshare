// src/components/user/pages/BookRide.jsx

import React from "react";

function BookRide() {
  // Example data — in a real app, fetch this from an API or context
  const pickupLocation = "123 Main Street, New York, NY";
  const dropoffLocation = "456 Park Avenue, New York, NY";
  const distance = "5.2 miles";
  const duration = "15 mins";
  const fare = "NPR 100"; // or $30.40 or any other currency

  const handleConfirm = () => {
    alert("Ride Confirmed!");
  };

  const handleCancel = () => {
    alert("Ride Canceled!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-6">Trip Details</h1>

        {/* Trip Info Card */}
        <div className="bg-white shadow-md rounded p-4 md:p-6 mb-6 flex flex-col md:flex-row">
          {/* Left column: pickup/dropoff */}
          <div className="flex-1">
            <div className="mb-4">
              <h2 className="font-semibold text-gray-600">Pickup Location</h2>
              <p>{pickupLocation}</p>
            </div>
            <div className="mb-4">
              <h2 className="font-semibold text-gray-600">Destination</h2>
              <p>{dropoffLocation}</p>
            </div>
            {/* Stats */}
            <div className="flex space-x-4 mb-4">
              <div>
                <h2 className="font-semibold text-gray-600">Distance</h2>
                <p>{distance}</p>
              </div>
              <div>
                <h2 className="font-semibold text-gray-600">Duration</h2>
                <p>{duration}</p>
              </div>
              <div>
                <h2 className="font-semibold text-gray-600">Fare</h2>
                <p>{fare}</p>
              </div>
            </div>
            {/* Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleConfirm}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Confirm Ride
              </button>
              <button
                onClick={handleCancel}
                className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200"
              >
                Cancel Ride
              </button>
            </div>
          </div>

          {/* Right column: driver details */}
          <div className="flex-1 mt-6 md:mt-0 md:ml-6">
            <div className="bg-gray-50 border p-4 rounded mb-6">
              <h2 className="font-semibold text-gray-700 mb-2">Driver Details</h2>
              <div className="flex items-center mb-2">
                <img
                  src="https://via.placeholder.com/40"
                  alt="Driver"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-semibold">Michael Johnson</p>
                  <p className="text-yellow-500 text-sm">★★★★★ (4.8)</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Toyota Camry - ABC 123</p>
              <p className="text-gray-600 text-sm">Verified Driver (background checked)</p>
              <p className="text-gray-600 text-sm">1205 Trips Completed</p>
              <button className="mt-3 w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
                Contact Driver
              </button>
            </div>
          </div>
        </div>

        {/* Map or route preview */}
        <div className="bg-white shadow-md rounded p-4 md:p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Route Preview</h2>
          <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400">
            Map Placeholder
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookRide;
