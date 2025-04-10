"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, X, AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";
import RatingModal from "../rating/RatingModal";

const BookingStatusBar = ({
  initialStatus = "pending",
  onStatusChange,
  tripDetails: propsTripDetails,
  userType = "user", // "user" or "driver"
  showConfirmationPopup = false,
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [showConfirmation, setShowConfirmation] = useState(
    showConfirmationPopup
  );
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);

  // Get user and driver details from Redux store
  const userData = useSelector(
    (state) => state.user?.userData?.Result?.user_data
  );
  const driverData = useSelector((state) => state.driver?.driverData);

  // Merge trip details from props with data from Redux
  const tripDetails = {
    ...propsTripDetails,
    // If userType is driver, show user details, otherwise show driver details
    passenger:
      userType === "driver" ? userData?.fullName : propsTripDetails?.passenger,
    driverName:
      userType === "user" ? driverData?.fullName : propsTripDetails?.driverName,
  };

  useEffect(() => {
    // When status changes externally, update local state
    if (initialStatus !== status) {
      setStatus(initialStatus);
    }

    // Show confirmation popup when explicitly requested
    if (showConfirmationPopup && !showConfirmation) {
      setShowConfirmation(true);
    }
  }, [initialStatus, showConfirmationPopup]);

  const getStatusPercentage = () => {
    switch (status) {
      case "pending":
        return 0;
      case "booked":
        return 33;
      case "confirmed":
        return 66;
      case "completed":
        return 100;
      case "cancelled":
        return 0;
      default:
        return 0;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "pending":
        return "#D1D5DB"; // gray-300
      case "booked":
        return "#FCD34D"; // yellow-300
      case "confirmed":
        return "#60A5FA"; // blue-400
      case "completed":
        return "#34D399"; // green-400
      case "cancelled":
        return "#F87171"; // red-400
      default:
        return "#D1D5DB"; // gray-300
    }
  };

  const handleConfirmBooking = () => {
    setStatus("confirmed");
    setShowConfirmation(false);
    if (onStatusChange) onStatusChange("confirmed");
  };

  const handleRejectBooking = () => {
    setStatus("cancelled");
    setShowConfirmation(false);
    if (onStatusChange) onStatusChange("cancelled");
  };

  const handleCompleteRide = () => {
    setStatus("completed");
    if (onStatusChange) onStatusChange("completed");

    // If user is a passenger, show rating modal
    if (userType === "user") {
      setShowRatingModal(true);
    }
  };

  // User-facing status message
  const getUserStatusMessage = () => {
    switch (status) {
      case "pending":
        return "Waiting for a driver...";
      case "booked":
        return "Your ride has been booked! Waiting for driver confirmation.";
      case "confirmed":
        return "A driver has confirmed your ride and is on the way!";
      case "completed":
        return "Your ride has been completed. Thank you for using our service!";
      case "cancelled":
        return "This ride has been cancelled.";
      default:
        return "";
    }
  };

  const handleRatingChange = (rating) => {
    setSelectedRating(rating);
  };

  return (
    <>
      <div className="w-full mb-4">
        <div className="flex justify-between mb-1 text-sm font-medium">
          <span>Booked</span>
          <span>Confirmed</span>
          <span>Completed</span>
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-full rounded-full transition-all duration-500 ease-in-out"
            style={{
              width: `${getStatusPercentage()}%`,
              backgroundColor: getStatusColor(),
            }}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
          <div
            className={`flex items-center ${
              status === "booked" ||
              status === "confirmed" ||
              status === "completed"
                ? "text-green-500"
                : "text-gray-400"
            }`}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-xs">Booked</span>
          </div>
          <div
            className={`flex items-center ${
              status === "confirmed" || status === "completed"
                ? "text-green-500"
                : "text-gray-400"
            }`}
          >
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-xs">Confirmed</span>
          </div>
          <div
            className={`flex items-center ${
              status === "completed" ? "text-green-500" : "text-gray-400"
            }`}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-xs">Completed</span>
          </div>
        </div>

        {/* Status message for users */}
        {userType === "user" && (
          <div className="mt-3 text-sm text-center">
            <p
              className={`
              ${status === "pending" ? "text-gray-600" : ""}
              ${status === "booked" ? "text-yellow-600" : ""}
              ${status === "confirmed" ? "text-blue-600" : ""}
              ${status === "completed" ? "text-green-600" : ""}
              ${status === "cancelled" ? "text-red-600" : ""}
            `}
            >
              {getUserStatusMessage()}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons for driver */}
      {userType === "driver" && (
        <div className="mt-2">
          {status === "booked" && !showConfirmation && (
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleRejectBooking}
                className="px-3 py-1 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={handleConfirmBooking}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Accept
              </button>
            </div>
          )}

          {status === "confirmed" && (
            <div className="flex justify-end">
              <button
                onClick={handleCompleteRide}
                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Mark as Completed
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation popup for driver */}
      {userType === "driver" && showConfirmation && status === "booked" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">New Booking Request</h3>
              <button
                onClick={handleRejectBooking}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">A user has requested a ride:</p>
              {tripDetails && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p>
                    <span className="font-medium">From:</span>{" "}
                    {tripDetails.from || "Not specified"}
                  </p>
                  <p>
                    <span className="font-medium">To:</span>{" "}
                    {tripDetails.to || "Not specified"}
                  </p>
                  <p>
                    <span className="font-medium">Passenger:</span>{" "}
                    {tripDetails.passenger ||
                      userData?.fullName ||
                      "Not specified"}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span>{" "}
                    {tripDetails.time || "Not specified"}
                  </p>
                  <p>
                    <span className="font-medium">Fare:</span>{" "}
                    {tripDetails.fare || "Not specified"}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="w-full">
                <div className="relative h-2 bg-gray-200 rounded-full">
                  <div
                    className="absolute h-full rounded-full transition-all duration-500 ease-in-out"
                    style={{
                      width: `33%`,
                      backgroundColor: "#FCD34D",
                    }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Booked</span>
                  <span>Confirmed</span>
                  <span>Completed</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleRejectBooking}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={handleConfirmBooking}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Accept Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User-side booking confirmation */}
      {userType === "user" && status === "booked" && (
        <div className="mt-4 p-4 border border-yellow-200 bg-yellow-50 rounded-md">
          <p className="text-yellow-700 text-sm">
            Your booking has been submitted! Waiting for driver confirmation.
          </p>
        </div>
      )}

      {/* User-side ride confirmed */}
      {userType === "user" && status === "confirmed" && (
        <div className="mt-4 p-4 border border-blue-200 bg-blue-50 rounded-md">
          <p className="text-blue-700 text-sm">
            Your ride has been confirmed! The driver is on the way.
          </p>
          {(tripDetails?.driverName || driverData?.fullName) && (
            <p className="text-blue-700 text-sm mt-2">
              Driver: {tripDetails.driverName || driverData?.fullName}
            </p>
          )}
        </div>
      )}

      {/* User-side ride completed */}
      {userType === "user" && status === "completed" && (
        <div className="mt-4 p-4 border border-green-200 bg-green-50 rounded-md">
          <p className="text-green-700 text-sm">
            Your ride has been completed! Thank you for using our service.
          </p>
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700">
              Rate your experience:
            </p>
            <div className="flex mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`text-xl ${
                    selectedRating >= star ? "text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => handleRatingChange(star)}
                >
                  ★
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowRatingModal(true)}
              className="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        bookingId={tripDetails?.id}
        tripDetails={tripDetails}
      />
    </>
  );
};

export default BookingStatusBar;
