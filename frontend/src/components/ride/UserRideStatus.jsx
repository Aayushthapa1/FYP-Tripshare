"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getActiveRide, updateRideStatus } from "../Slices/rideSlice";
import { Toaster, toast } from "sonner";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import {
  MapPin,
  Clock,
  Car,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader,
  Calendar,
  Phone,
  Navigation,
  Star,
  MessageSquare,
} from "lucide-react";

/**
 * This component shows the user's current ride status (passenger side).
 * If the ride is "requested" (not accepted yet), we show "Waiting for driver..."
 * If the user wants to cancel, we call updateRideStatus with status="canceled".
 */
const RideStatus = () => {
  const dispatch = useDispatch();

  // For example, your slice might store the active ride here:
  const { activeRide, loading, error } = useSelector((state) => state.ride);

  // For debugging
  useEffect(() => {
    if (activeRide) {
      console.log("Active ride data:", JSON.stringify(activeRide, null, 2));
    }
  }, [activeRide]);

  // We'll fetch the active ride if not present
  // Assume you are storing user in state.auth.user, with user._id
  const { user } = useSelector((state) => state.auth) || {};

  // State for cancel confirmation
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (user && user._id) {
      dispatch(
        getActiveRide({ userId: user._id, userType: "passenger" }) // or "driver" if relevant
      );
    }
  }, [user, dispatch]);

  // Set up a refresh interval for active rides
  useEffect(() => {
    let interval;

    if (
      activeRide &&
      ["requested", "accepted", "picked up"].includes(activeRide.status)
    ) {
      interval = setInterval(() => {
        if (user && user._id) {
          dispatch(getActiveRide({ userId: user._id, userType: "passenger" }));
        }
      }, 15000); // Refresh every 15 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeRide, user, dispatch]);

  const handleCancelRide = async () => {
    if (!activeRide) return;

    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      const payload = {
        rideId: activeRide._id,
        status: "canceled",
        cancelReason: cancelReason,
      };
      const result = await dispatch(updateRideStatus(payload)).unwrap();
      if (result.success) {
        toast.success("Ride canceled successfully.");
        setShowCancelConfirm(false);
        setCancelReason("");
      } else {
        toast.error(result.message || "Failed to cancel ride");
      }
    } catch (err) {
      toast.error(`Cancel ride error: ${err}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // Format location data to be more user-friendly
  const formatLocation = (location) => {
    if (!location) return "Not specified";

    // If it's a string, return it directly
    if (typeof location === "string") return location;

    // If it has an address property, use that
    if (location.address) return location.address;

    // If it has latitude and longitude
    if (location.latitude && location.longitude) {
      // Format to 6 decimal places max for readability
      const lat = Number.parseFloat(location.latitude).toFixed(6);
      const lng = Number.parseFloat(location.longitude).toFixed(6);

      // Check if we have a name property to use
      if (location.name) return location.name;

      // Return formatted coordinates
      return `${lat}, ${lng}`;
    }

    // If it's an object but we can't extract useful info
    return "Location details unavailable";
  };

  // Get status details
  const getStatusDetails = () => {
    if (!activeRide) return {};

    const statusMap = {
      requested: {
        icon: <Clock className="w-6 h-6 text-blue-500" />,
        color: "blue",
        title: "Ride Requested",
        description: "Waiting for a driver to accept your ride request...",
        progress: 20,
      },
      accepted: {
        icon: <CheckCircle className="w-6 h-6 text-green-500" />,
        color: "green",
        title: "Ride Accepted",
        description:
          "A driver has accepted your ride and is on the way to pick you up!",
        progress: 40,
      },
      "picked up": {
        icon: <Car className="w-6 h-6 text-yellow-500" />,
        color: "yellow",
        title: "On the Way",
        description: "You're currently on your ride. Enjoy the journey!",
        progress: 70,
      },
      completed: {
        icon: <CheckCircle className="w-6 h-6 text-green-500" />,
        color: "green",
        title: "Ride Completed",
        description:
          "Your ride has been completed successfully. Thank you for riding with us!",
        progress: 100,
      },
      canceled: {
        icon: <XCircle className="w-6 h-6 text-red-500" />,
        color: "red",
        title: "Ride Canceled",
        description: activeRide.cancelReason || "This ride was canceled.",
        progress: 100,
      },
      rejected: {
        icon: <XCircle className="w-6 h-6 text-red-500" />,
        color: "red",
        title: "Ride Rejected",
        description: "Unfortunately, your ride request was rejected.",
        progress: 100,
      },
    };

    return (
      statusMap[activeRide.status] || {
        icon: <AlertTriangle className="w-6 h-6 text-gray-500" />,
        color: "gray",
        title: "Unknown Status",
        description: "The status of this ride is unknown.",
        progress: 0,
      }
    );
  };

  const statusDetails = getStatusDetails();

  // Render
  return (
    <>
      <Navbar />
      <Toaster richColors position="top-center" />

      <div className="bg-gray-50 min-h-screen pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <h1 className="text-2xl font-bold flex items-center">
                <Car className="mr-2" /> Ride Status
              </h1>
              <p className="text-blue-100 mt-1">
                Track your current ride in real-time
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-600">
                    Loading your ride information...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium text-red-800">
                        Error Loading Ride
                      </h3>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* No Active Ride */}
              {!loading && !error && !activeRide && (
                <div className="text-center py-10">
                  <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    No Active Rides
                  </h2>
                  <p className="text-gray-600 mb-6">
                    You don't have any active rides at the moment.
                  </p>
                  <button
                    onClick={() => (window.location.href = "/request-ride")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Request a Ride
                  </button>
                </div>
              )}

              {/* Active Ride */}
              {!loading && activeRide && (
                <div>
                  {/* Status Progress */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {statusDetails.icon}
                        <h2
                          className={`text-lg font-semibold ml-2 text-${statusDetails.color}-700`}
                        >
                          {statusDetails.title}
                        </h2>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(activeRide.createdAt)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${statusDetails.color}-500 transition-all duration-500 ease-out`}
                        style={{ width: `${statusDetails.progress}%` }}
                      ></div>
                    </div>

                    {/* Status Description */}
                    <p className="mt-2 text-gray-600">
                      {statusDetails.description}
                    </p>
                  </div>

                  {/* Ride Details */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-gray-800 mb-3">
                      Ride Details
                    </h3>

                    <div className="space-y-3">
                      {/* Pickup Location */}
                      <div className="flex items-start">
                        <div className="mt-1">
                          <MapPin className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-gray-500">
                            Pickup Location
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatLocation(activeRide.pickupLocation)}
                          </p>
                        </div>
                      </div>

                      {/* Destination */}
                      <div className="flex items-start">
                        <div className="mt-1">
                          <Navigation className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-gray-500">Destination</p>
                          <p className="font-medium text-gray-900">
                            {formatLocation(activeRide.destination) ||
                              "Not specified"}
                          </p>
                        </div>
                      </div>

                      {/* Ride ID */}
                      <div className="flex items-start">
                        <div className="mt-1">
                          <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-gray-500">Ride ID</p>
                          <p className="font-medium text-gray-900">
                            {activeRide._id}
                          </p>
                        </div>
                      </div>

                      {/* Fare */}
                      {activeRide.fare && (
                        <div className="flex items-start">
                          <div className="mt-1">
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs text-gray-500">
                              Estimated Fare
                            </p>
                            <p className="font-medium text-gray-900">
                              ₹{activeRide.fare}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Driver Details (if ride is accepted or picked up) */}
                  {activeRide.driver &&
                    (activeRide.status === "accepted" ||
                      activeRide.status === "picked up") && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-gray-800 mb-3">
                          Driver Information
                        </h3>

                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">
                              {activeRide.driver.name || "Driver"}
                            </p>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < (activeRide.driver.rating || 4)
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-xs text-gray-500">
                                ({activeRide.driver.rating || "4.0"})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Phone */}
                          {activeRide.driver.phone && (
                            <a
                              href={`tel:${activeRide.driver.phone}`}
                              className="flex items-center justify-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors"
                            >
                              <Phone className="w-5 h-5 text-blue-600 mr-2" />
                              <span className="font-medium text-gray-800">
                                Call Driver
                              </span>
                            </a>
                          )}

                          {/* Message */}
                          <a
                            href={`/messages?driver=${activeRide.driver._id}`}
                            className="flex items-center justify-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors"
                          >
                            <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="font-medium text-gray-800">
                              Message
                            </span>
                          </a>
                        </div>

                        {/* Vehicle Details */}
                        {activeRide.driver.vehicle && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-start">
                              <Car className="w-5 h-5 text-gray-500 mt-0.5" />
                              <div className="ml-2">
                                <p className="font-medium text-gray-800">
                                  {activeRide.driver.vehicle.model || "Vehicle"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {activeRide.driver.vehicle.color || "Color"} ·{" "}
                                  {activeRide.driver.vehicle.plateNumber ||
                                    "License Plate"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="mt-6">
                    {/* Show "Cancel Ride" if status is requested, accepted, or picked up */}
                    {(activeRide.status === "requested" ||
                      activeRide.status === "accepted" ||
                      activeRide.status === "picked up") && (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Cancel Ride
                      </button>
                    )}

                    {/* Show "Request New Ride" if status is completed, canceled, or rejected */}
                    {(activeRide.status === "completed" ||
                      activeRide.status === "canceled" ||
                      activeRide.status === "rejected") && (
                      <button
                        onClick={() => (window.location.href = "/request-ride")}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Car className="w-5 h-5 mr-2" />
                        Request New Ride
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Cancel Ride
              </h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this ride? This action cannot be
                undone.
              </p>

              <div className="mb-4">
                <label
                  htmlFor="cancelReason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Reason for cancellation
                </label>
                <textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows="3"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setCancelReason("");
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleCancelRide}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default RideStatus;
