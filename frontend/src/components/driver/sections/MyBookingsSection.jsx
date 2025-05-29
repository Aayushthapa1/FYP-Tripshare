"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import {
  fetchDriverPendingBookings,
  fetchDriverBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
  clearActionSuccess,
  clearBookingError,
  cancelBooking,
} from "../../Slices/bookingSlice";
import {
  completeTrip, // Import the completeTrip action
} from "../../Slices/tripSlice";
import {
  MapPin,
  ChevronLeft,
  Check,
  X,
  CheckCircle,
  ArrowRight,
  Filter,
  Search,
  ClockIcon,
  AlertCircle,
  PlusCircle,
  History,
  Route,
  ChevronRight,
  Loader2,
  Flag,
} from "lucide-react";

const DriverBookingManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get auth user
  const { user } = useSelector((state) => state.auth) || {};

  // Get bookings from Redux state
  const { loading, error, pendingBookings, driverBookings, actionSuccess } =
    useSelector((state) => state.booking);

  // Get trips state to monitor trip completion
  const {
    loading: tripLoading,
    error: tripError,
    success: tripSuccess,
  } = useSelector((state) => state.trip);

  // Local state
  const [activeTab, setActiveTab] = useState("pending"); // "pending", "booked", "all"
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [processingTripIds, setProcessingTripIds] = useState([]); // Track trips being completed

  // Fetch bookings on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        dispatch(fetchDriverPendingBookings()),
        dispatch(fetchDriverBookings()),
      ]);
      setInitialDataLoaded(true);
    };

    fetchInitialData();
  }, [dispatch]);

  // Handle booking action success
  useEffect(() => {
    if (actionSuccess) {
      // Refresh data
      dispatch(fetchDriverPendingBookings());
      dispatch(fetchDriverBookings());

      // Close modals
      setShowRejectionModal(false);
      setRejectionReason("");

      // Clear success flag
      dispatch(clearActionSuccess());

      // Use a single toast for success notification
      toast.dismiss(); // Clear any existing toasts
      toast.success("Action completed successfully!");
    }
  }, [actionSuccess, dispatch]);

  // Handle trip completion success or error
  useEffect(() => {
    if (tripSuccess && processingTripIds.length > 0) {
    
      dispatch(fetchDriverPendingBookings());
      dispatch(fetchDriverBookings());
      setProcessingTripIds([]); // Clear processing state
      toast.success("Trip marked as completed!");
    }

    if (tripError) {
      setProcessingTripIds([]); // Clear processing state
      toast.error("Trip Completion Error", {
        description: tripError || "Failed to complete trip. Please try again.",
      });
    }
  }, [tripSuccess, tripError, dispatch, processingTripIds.length]);

  // Handle booking error
  useEffect(() => {
    if (error) {
      toast.dismiss(); // Clear any existing toasts
      toast.error("Error", {
        description: error || "An error occurred. Please try again.",
      });
      dispatch(clearBookingError());
    }
  }, [error, dispatch]);

  // Filter bookings based on status and search term
  useEffect(() => {
    if (!initialDataLoaded) return;

    let bookingsToFilter = [];

    if (activeTab === "pending") {
      bookingsToFilter = [...pendingBookings];
    } else if (activeTab === "booked") {
      bookingsToFilter = driverBookings.filter(
        (booking) => booking.status === "booked"
      );
    } else {
      // For "all" tab, combine pending and driver bookings
      bookingsToFilter = [...pendingBookings, ...driverBookings];

      // Remove duplicates (if any)
      const uniqueIds = new Set();
      bookingsToFilter = bookingsToFilter.filter((booking) => {
        if (uniqueIds.has(booking._id)) return false;
        uniqueIds.add(booking._id);
        return true;
      });
    }

    // Apply status filter for "all" tab only
    if (activeTab === "all" && statusFilter !== "all") {
      bookingsToFilter = bookingsToFilter.filter(
        (booking) => booking.status === statusFilter
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      bookingsToFilter = bookingsToFilter.filter(
        (booking) =>
          (booking.trip?.departureLocation || "")
            .toLowerCase()
            .includes(term) ||
          (booking.trip?.destinationLocation || "")
            .toLowerCase()
            .includes(term) ||
          (booking._id || "").toLowerCase().includes(term) ||
          (booking.user?.fullName || "").toLowerCase().includes(term)
      );
    }

    setFilteredBookings(bookingsToFilter);
  }, [
    activeTab,
    statusFilter,
    searchTerm,
    pendingBookings,
    driverBookings,
    initialDataLoaded,
  ]);

  // Helper function to check if driver has any bookings (past or present)
  const hasAnyBookings = () => {
    return driverBookings.length > 0 || pendingBookings.length > 0;
  };

  // Helper function to check if there are past bookings
  const hasPastBookings = () => {
    return driverBookings.some(
      (booking) =>
        booking.status === "completed" || booking.status === "cancelled"
    );
  };

  // Group bookings by trip ID
  const getBookingsByTrip = () => {
    if (!driverBookings.length) return {};

    const tripBookings = {};

    driverBookings.forEach((booking) => {
      if (!booking.trip?._id) return;

      if (!tripBookings[booking.trip._id]) {
        tripBookings[booking.trip._id] = {
          tripId: booking.trip._id,
          tripDetails: booking.trip,
          bookings: [],
        };
      }

      tripBookings[booking.trip._id].bookings.push(booking);
    });

    return tripBookings;
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle completing a trip
  // Handle completing a trip (updated)
  const handleCompleteTrip = async (tripId) => {
    const tripBookings = getBookingsByTrip();
    const tripInfo = tripBookings[tripId];

    if (!tripInfo) {
      toast.error("Trip information not found");
      return;
    }

    // Count active bookings
    const pendingBookings = tripInfo.bookings.filter(
      (b) => b.status === "pending"
    ).length;
    const bookedBookings = tripInfo.bookings.filter(
      (b) => b.status === "booked"
    ).length;

    // Create appropriate message based on booking statuses
    let description =
      "Are you sure you want to mark this entire trip as completed?";

    if (pendingBookings > 0 || bookedBookings > 0) {
      description = `This will mark the trip as completed and:
${
  bookedBookings > 0
    ? `• Auto-complete ${bookedBookings} active booking(s)`
    : ""
}
${
  pendingBookings > 0
    ? `• Auto-cancel ${pendingBookings} pending booking request(s)`
    : ""
}`;
    }

    const toastId = toast("Confirm Trip Completion", {
      description,
      action: {
        label: "Complete Trip",
        onClick: async () => {
          try {
            toast.dismiss(toastId);
            setProcessingTripIds((prev) => [...prev, tripId]);

            // Call the API to complete the trip
            await dispatch(completeTrip(tripId)).unwrap();

            // Refresh data after successful completion
            await Promise.all([
              dispatch(fetchDriverPendingBookings()),
              dispatch(fetchDriverBookings()),
            ]);

            toast.success("Trip marked as completed successfully!");
          } catch (error) {
            console.error("Error completing trip:", error);
            toast.error("Error", {
              description:
                error.message || "Failed to complete trip. Please try again.",
            });
          } finally {
            setProcessingTripIds((prev) => prev.filter((id) => id !== tripId));
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast.dismiss(toastId);
        },
      },
      position: "top-right",
      duration: 12000, // Give more time to read the details
    });
  };

  // Handle accepting a booking
  const handleAcceptBooking = async (bookingId) => {
    const toastId = toast("Confirm Action", {
      description: "Are you sure you want to accept this booking?",
      action: {
        label: "Accept",
        onClick: async () => {
          try {
            toast.dismiss(toastId);
            await dispatch(acceptBooking(bookingId)).unwrap();
          } catch (error) {
            console.error("Error accepting booking:", error);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast.dismiss(toastId);
        },
      },
      position: "top-right",
      duration: 10000,
    });
  };

  // Handle rejecting a booking (open modal)
  const handleRejectClick = (bookingId) => {
    setSelectedBookingId(bookingId);
    setShowRejectionModal(true);
  };

  // Submit rejection reason
  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await dispatch(
        rejectBooking({
          bookingId: selectedBookingId,
          reason: rejectionReason,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error rejecting booking:", error);
    }
  };

  // Handle completing a booking
  const handleCompleteBooking = async (bookingId) => {
    const toastId = toast("Confirm Action", {
      description: "Are you sure you want to mark this booking as completed?",
      action: {
        label: "Complete",
        onClick: async () => {
          try {
            toast.dismiss(toastId);
            await dispatch(completeBooking(bookingId)).unwrap();
          } catch (error) {
            console.error("Error completing booking:", error);
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast.dismiss(toastId);
        },
      },
      position: "top-right",
      duration: 10000,
    });
  };

  // Handle cancel booking
  const handleCancelBooking = async (bookingId, e) => {
    if (e) e.stopPropagation();
    const toastId = toast("Confirm Action", {
      description: "Are you sure you want to cancel this booking?",
      action: {
        label: "Cancel Booking",
        onClick: async () => {
          try {
            toast.dismiss(toastId);
            await dispatch(cancelBooking(bookingId)).unwrap();
          } catch (error) {
            console.error("Cancel booking error:", error);
          }
        },
      },
      cancel: {
        label: "Keep",
        onClick: () => {
          toast.dismiss(toastId);
        },
      },
      position: "top-right",
      duration: 10000,
    });
  };

  // View booking details
  const viewBookingDetails = (bookingId) => {
    navigate(`/booking/bookingId=${bookingId}`);
  };

  // Navigate to publish a trip page
  const handlePublishTrip = () => {
    navigate("/tripform");
  };

  // Navigate to trip history
  const handleViewTripHistory = () => {
    setActiveTab("all");
    setStatusFilter("completed");
  };

  // Handle go back
  const handleGoBack = () => {
    navigate(-1);
  };

  // Render loading state
  if (loading && !initialDataLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300 font-medium">
            Loading bookings...
          </p>
        </div>
      </div>
    );
  }

  // Render empty state when no bookings match the filter
  const renderEmptyState = () => {
    // Different message based on current filter/tab
    const getEmptyStateMessage = () => {
      if (activeTab === "pending") {
        return "You don't have any pending booking requests.";
      } else if (activeTab === "booked") {
        return "You don't have any active bookings.";
      } else if (statusFilter !== "all") {
        return `No ${statusFilter} bookings found. Try changing your filter.`;
      } else if (hasAnyBookings()) {
        return "No bookings match your current filters.";
      } else {
        return "You don't have any bookings yet. Start by publishing a trip.";
      }
    };

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
            No bookings found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {getEmptyStateMessage()}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Show "View All Bookings" button when using a filter */}
            {statusFilter !== "all" && activeTab === "all" && (
              <button
                onClick={() => setStatusFilter("all")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Filter size={18} className="mr-1.5" /> View All Bookings
              </button>
            )}

            {/* Option to publish a trip */}
            <button
              onClick={handlePublishTrip}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <PlusCircle size={18} className="mr-1.5" /> Publish a Trip
            </button>

            {/* Option to view trip history if there are past bookings */}
            {hasPastBookings() && (
              <button
                onClick={handleViewTripHistory}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center"
              >
                <History size={18} className="mr-1.5" /> View Trip History
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Show active trips with the complete trip button
  // This is a new section that displays trips with active bookings
  const renderActiveTrips = () => {
    const tripBookings = getBookingsByTrip();
    const activeTrips = Object.values(tripBookings).filter(
      (group) =>
        group.tripDetails.status !== "completed" &&
        group.bookings.some((b) => b.status === "booked")
    );

    if (activeTab !== "booked" || activeTrips.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-white">
          Active Trips
        </h3>
        <div className="space-y-4">
          {activeTrips.map((group) => (
            <div
              key={group.tripId}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-100 dark:border-slate-700 overflow-hidden"
            >
              <div className="bg-blue-50 text-blue-800 px-4 py-3 border-b border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Route size={18} />
                  <span className="font-medium">
                    Trip: {group.tripDetails.departureLocation} →{" "}
                    {group.tripDetails.destinationLocation}
                  </span>
                </div>
                <div className="text-sm">
                  {formatDate(group.tripDetails.departureDate)} at{" "}
                  {group.tripDetails.departureTime}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {
                          group.bookings.filter((b) => b.status === "booked")
                            .length
                        }
                      </span>{" "}
                      active bookings
                      {group.bookings.filter((b) => b.status === "completed")
                        .length > 0 &&
                        ` • ${
                          group.bookings.filter((b) => b.status === "completed")
                            .length
                        } completed`}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCompleteTrip(group.tripId)}
                    disabled={
                      processingTripIds.includes(group.tripId) || tripLoading
                    }
                    className={`px-4 py-2 ${
                      processingTripIds.includes(group.tripId)
                        ? "bg-slate-300 cursor-not-allowed dark:bg-slate-700"
                        : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                    } rounded-lg transition-colors flex items-center`}
                  >
                    {processingTripIds.includes(group.tripId) ? (
                      <>
                        <Loader2 size={16} className="mr-1.5 animate-spin" />{" "}
                        Processing...
                      </>
                    ) : (
                      <>
                        <Flag size={16} className="mr-1.5" /> Complete Entire
                        Trip
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-right" richColors closeButton theme="light" />

      {/* Page Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="flex items-center">
            <button
              onClick={handleGoBack}
              className="mr-3 flex items-center justify-center rounded-full w-8 h-8 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-slate-500 text-lg dark:text-slate-400">
                Manage your ride bookings and requests
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 sm:mt-0 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "pending"
                ? "bg-amber-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            Pending ({pendingBookings.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("booked");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "booked"
                ? "bg-green-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            Current Bookings
          </button>

          <button
            onClick={() => {
              setActiveTab("all");
              setStatusFilter("all");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-blue-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            All History
          </button>

          <div className="ml-auto flex gap-3">
            <button
              onClick={handlePublishTrip}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <PlusCircle size={18} className="mr-1.5" /> Publish Trip
            </button>

            <button
              onClick={() => navigate("/driver-trips")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Route size={18} className="mr-1.5" /> My Trips
            </button>
          </div>
        </div>
      </div>

      {/* Status Filters (only for "all" tab) */}
      {activeTab === "all" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === "all"
                  ? "bg-green-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === "pending"
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter("booked")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === "booked"
                  ? "bg-green-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              Booked
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === "completed"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter("cancelled")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === "cancelled"
                  ? "bg-red-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {loading && initialDataLoaded ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
            <p className="mt-4 text-slate-500 dark:text-slate-400">
              Updating bookings...
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* New section: Active Trips with Complete Trip button */}
          {renderActiveTrips()}

          {/* Individual Bookings List */}
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {activeTab === "booked" && filteredBookings.length > 0 && (
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Individual Bookings
                </h3>
              )}

              {filteredBookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-slate-100 dark:border-slate-700"
                >
                  {/* Status Badge */}
                  <div
                    className={`${getStatusColor(
                      booking.status
                    )} px-4 py-2 flex justify-between items-center dark:border-slate-700`}
                  >
                    <div className="flex items-center">
                      {getStatusIcon(booking.status)}
                      <span className="ml-2 font-medium capitalize">
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-xs font-medium">
                      {formatDate(booking.trip?.departureDate)}
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Trip Route */}
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <MapPin size={16} className="text-green-500 mr-2" />
                        <div className="flex items-center">
                          <span className="font-medium dark:text-white">
                            {booking.trip?.departureLocation}
                          </span>
                          <ArrowRight
                            size={14}
                            className="mx-2 text-slate-400"
                          />
                          <span className="font-medium dark:text-white">
                            {booking.trip?.destinationLocation}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-2">
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Time
                          </p>
                          <p className="font-medium dark:text-white">
                            {booking.trip?.departureTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Seats
                          </p>
                          <p className="font-medium dark:text-white">
                            {booking.seatsBooked}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Payment
                          </p>
                          <div
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                              booking.paymentStatus
                            )}`}
                          >
                            {booking.paymentStatus}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Amount
                          </p>
                          <p className="font-medium dark:text-white">
                            Rs{booking.trip?.price * booking.seatsBooked}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Passenger Info & Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-medium">
                          {(booking.user?.fullName || "P").charAt(0)}
                        </div>
                        <span className="text-sm ml-2 dark:text-white">
                          {booking.user?.fullName || "Passenger"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleAcceptBooking(booking._id)}
                              className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors flex items-center dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                            >
                              <Check size={14} className="mr-1" /> Accept
                            </button>
                            <button
                              onClick={() => handleRejectClick(booking._id)}
                              className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors flex items-center dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                            >
                              <X size={14} className="mr-1" /> Reject
                            </button>
                          </>
                        )}
                        {booking.status === "booked" && (
                          <>
                            <button
                              onClick={() => handleCompleteBooking(booking._id)}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors flex items-center dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                            >
                              <CheckCircle size={14} className="mr-1" />{" "}
                              Complete
                            </button>
                            <button
                              onClick={(e) =>
                                handleCancelBooking(booking._id, e)
                              }
                              className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors flex items-center dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                            >
                              <X size={14} className="mr-1" /> Cancel
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => viewBookingDetails(booking._id)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition-colors flex items-center dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                        >
                          <ChevronRight size={14} className="mr-1" /> Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            renderEmptyState()
          )}
        </>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">
              Reject Booking
            </h3>
            <p className="mb-2 text-slate-600 dark:text-slate-300">
              Please provide a reason for rejecting this booking:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg mb-4 h-32 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
              placeholder="Type reason here..."
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                disabled={!rejectionReason.trim()}
              >
                Reject Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions for status styling
function getStatusColor(status) {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-800 border-b border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50";
    case "booked":
      return "bg-green-50 text-green-800 border-b border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50";
    case "completed":
      return "bg-blue-50 text-blue-800 border-b border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50";
    case "cancelled":
      return "bg-red-50 text-red-800 border-b border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50";
    default:
      return "bg-slate-50 text-slate-800 border-b border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "pending":
      return (
        <ClockIcon size={18} className="text-amber-600 dark:text-amber-400" />
      );
    case "booked":
      return <Check size={18} className="text-green-600 dark:text-green-400" />;
    case "completed":
      return (
        <CheckCircle size={18} className="text-blue-600 dark:text-blue-400" />
      );
    case "cancelled":
      return <X size={18} className="text-red-600 dark:text-red-400" />;
    default:
      return (
        <AlertCircle size={18} className="text-slate-600 dark:text-slate-400" />
      );
  }
}

function getPaymentStatusColor(status) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case "paid":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
  }
}

export default DriverBookingManagement;
