"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteTrip,
  updateTrip,
  getTrips,
  getTripById,
  searchTrips,
  cleanupExpiredTrips,
} from "../Slices/tripSlice";
import { fetchMyBookings } from "../Slices/bookingSlice";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  User,
  Car,
  Check,
  X,
  Edit,
  Trash,
  Info,
  Home,
  ToggleLeft,
  ChevronRight,
  Plus,
  Save,
  Sliders,
  Search,
  Star,
  ChevronLeft,
  ChevronDown,
  Filter,
  AlertTriangle,
} from "lucide-react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import Pagination from "../../utils/Pagination.jsx";
import { useSearchParams } from "react-router-dom";
import EnhancedGoogleMap from "./EnhancedGoogleMap";

const TripList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auth user
  const { user } = useSelector((state) => state.auth) || {};

  const {
    trips = [],
    loading,
    error,
    cleanupStats,
  } = useSelector((state) => state.trip);
  const { myBookings = [] } = useSelector((state) => state.booking) || {};

  // State for modals
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  // State for confirmation modals
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [statusConfirmation, setStatusConfirmation] = useState(null);
  const [updateConfirmation, setUpdateConfirmation] = useState(null);

  // For filtering and search
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // For sorting
  const [sortBy, setSortBy] = useState("newest");

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const tripsPerPage = 5;

  // For mobile view
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(getTrips());
    dispatch(fetchMyBookings());

    // Clean up expired trips
    if (user && user._id) {
      dispatch(cleanupExpiredTrips())
        .unwrap()
        .then((result) => {
          if (result && result.removedCount > 0) {
            toast.info(
              `${result.removedCount} expired trips were automatically removed`
            );
          }
        })
        .catch((error) => {
          console.error("Failed to clean expired trips:", error);
        });
    }

    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch, user]);

  // --- ACTION HANDLERS ---

  const handleDeleteClick = (trip) => {
    setDeleteConfirmation(trip);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      toast.loading("Deleting trip...");
      await dispatch(deleteTrip(deleteConfirmation._id)).unwrap();
      toast.dismiss();
      toast.success("Trip deleted successfully", {
        description: "The trip has been permanently removed",
      });
      setDeleteConfirmation(null);
      dispatch(getTrips());
    } catch (err) {
      toast.dismiss();
      toast.error(err?.message || "Failed to delete trip", {
        description: err?.cause || "Please try again later",
      });
    }
  };

  const handleStatusClick = (tripId, currentStatus) => {
    const newStatus = currentStatus === "scheduled" ? "cancelled" : "scheduled";
    setStatusConfirmation({ tripId, currentStatus, newStatus });
  };

  const confirmStatusUpdate = async () => {
    if (!statusConfirmation) return;

    try {
      const { tripId, newStatus } = statusConfirmation;
      toast.loading(`Updating trip status to ${newStatus}...`);
      await dispatch(
        updateTrip({ tripId, tripData: { status: newStatus } })
      ).unwrap();
      toast.dismiss();
      toast.success(`Trip status updated to "${newStatus}"`, {
        description:
          newStatus === "cancelled"
            ? "Passengers will be notified"
            : "Trip is now visible to passengers",
      });
      setStatusConfirmation(null);
      dispatch(getTrips());
    } catch (err) {
      toast.dismiss();
      toast.error(err?.message || "Failed to update status", {
        description: "Please try again later",
      });
    }
  };

  // "View Details" modal
  const handleViewDetails = (trip) => {
    setSelectedTrip(trip);
  };

  const closeDetailsModal = () => {
    setSelectedTrip(null);
  };

  // "Edit" modal
  const handleEditClick = async (trip) => {
    try {
      toast.loading("Loading trip details...");
      await dispatch(getTripById(trip._id)).unwrap();
      toast.dismiss();
      setEditingTrip(trip);
      setEditFormData({ ...trip });
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to fetch trip details", {
        description: err?.message || "Please try again",
      });
    }
  };

  const closeEditModal = () => {
    setEditingTrip(null);
    setEditFormData(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTrip || !editFormData) return;

    // Validation
    if (!editFormData.departureLocation || !editFormData.destinationLocation) {
      toast.error("Departure and destination locations are required");
      return;
    }

    if (!editFormData.departureDate || !editFormData.departureTime) {
      toast.error("Departure date and time are required");
      return;
    }

    // Validate future date
    const departureDate = new Date(editFormData.departureDate);
    departureDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (departureDate < today) {
      toast.error("Departure date must be in the future");
      return;
    }

    // Show confirmation modal
    setUpdateConfirmation(editFormData);
  };

  const confirmUpdate = async () => {
    if (!editingTrip || !updateConfirmation) return;

    try {
      toast.loading("Updating trip...");
      await dispatch(
        updateTrip({
          tripId: editingTrip._id,
          tripData: updateConfirmation,
        })
      ).unwrap();
      toast.dismiss();
      toast.success("Trip updated successfully", {
        description: "All changes have been saved",
      });
      setUpdateConfirmation(null);
      closeEditModal();
      dispatch(getTrips());
    } catch (err) {
      toast.dismiss();
      toast.error(err?.message || "Failed to update trip", {
        description: "Please try again later",
      });
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => {
      if (!prev) return prev;
      if (type === "checkbox") {
        return {
          ...prev,
          preferences: { ...prev.preferences, [name]: checked },
        };
      } else if (name.startsWith("vehicleDetails.")) {
        const field = name.split(".")[1];
        return {
          ...prev,
          vehicleDetails: {
            ...prev.vehicleDetails,
            [field]: value,
          },
        };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  // Redirect to booking page with trip data
  const handleBooking = (trip) => {
    navigate(`/booking/${trip._id}`);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      toast.loading("Searching trips...");
      dispatch(searchTrips(searchTerm))
        .unwrap()
        .then((result) => {
          toast.dismiss();
          if (!result || result.length === 0) {
            toast.info("No trips found matching your search criteria");
          } else {
            toast.success(`Found ${result.length} trips matching your search`);
          }
        })
        .catch((error) => {
          toast.dismiss();
          toast.error(`Search failed: ${error.message || "Unknown error"}`);
        });
      setCurrentPage(1);
    } else {
      dispatch(getTrips());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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

  // Format date to show time since creation
  const formatTimeSince = (dateString) => {
    if (!dateString) return "";

    const date = dateString instanceof Date ? dateString : new Date(dateString);

    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return formatDate(dateString);
  };

  // Get creation date for a trip from either createdAt field or _id
  const getTripDate = (trip) => {
    if (trip.createdAt) return new Date(trip.createdAt);
    // Extract creation time from MongoDB _id (first 8 chars are a timestamp)
    if (trip._id && trip._id.length >= 8) {
      return new Date(Number.parseInt(trip._id.substring(0, 8), 16) * 1000);
    }
    return new Date();
  };

  // Get today's date without time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sort trips based on selected sort criteria
  const sortTrips = (trips) => {
    if (sortBy === "newest") {
      // Sort by createdAt field, newest first
      return [...trips].sort((a, b) => {
        const dateA = getTripDate(a);
        const dateB = getTripDate(b);
        return dateB - dateA;
      });
    } else if (sortBy === "price") {
      // Sort by price, lowest first
      return [...trips].sort((a, b) => a.price - b.price);
    } else if (sortBy === "departure") {
      // Sort by departure date, soonest first
      return [...trips].sort((a, b) => {
        const dateA = new Date(a.departureDate);
        const dateB = new Date(b.departureDate);
        return dateA - dateB;
      });
    }
    return trips;
  };

  // Filter trips
  const filteredTrips = sortTrips(
    trips.filter((trip) => {
      const tripDate = new Date(trip.departureDate);
      tripDate.setHours(0, 0, 0, 0);

      // Filter out trips with 0 available seats
      const hasAvailableSeats = trip.availableSeats > 0;

      // Filter out trips with past departure dates
      const isFutureTrip = tripDate >= today;

      // Filter by status
      const statusFilterMatch =
        statusFilter === "all" || trip.status === statusFilter;

      return hasAvailableSeats && isFutureTrip && statusFilterMatch;
    })
  );

  // Pagination logic
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);

  // Handle page change with loading state
  const handlePageChange = (pageNumber) => {
    setIsPaginationLoading(true);
    setCurrentPage(pageNumber);

    // Simulate loading for better UX
    setTimeout(() => {
      setIsPaginationLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading trips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Error Loading Trips
            </h2>
            <p className="text-center text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center"
            >
              <Home className="w-4 h-4 mr-2" /> Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Trip Listings
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Filter size={18} className="text-gray-700" />
              </button>
              <div className="hidden md:flex items-center bg-white border border-gray-300 rounded-full overflow-hidden">
                <input
                  type="text"
                  placeholder="Search trips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="px-4 py-2 text-sm border-none focus:outline-none w-64"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-green-500 text-white hover:bg-green-600"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className={`bg-white shadow-sm border-b border-gray-200 transition-all duration-300 ${
          showFilters ? "max-h-96" : "max-h-16"
        } md:max-h-none overflow-hidden`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center justify-between md:justify-start">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      statusFilter === "all"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter("scheduled")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      statusFilter === "scheduled"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Scheduled
                  </button>
                  <button
                    onClick={() => setStatusFilter("cancelled")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      statusFilter === "cancelled"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Cancelled
                  </button>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden"
                >
                  <ChevronDown
                    size={20}
                    className={`text-gray-500 transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center space-x-3 mt-2 md:mt-0">
                <span className="text-sm text-gray-500">Sort by:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSortBy("newest")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      sortBy === "newest"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => setSortBy("price")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      sortBy === "price"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Price
                  </button>
                  <button
                    onClick={() => setSortBy("departure")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      sortBy === "departure"
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Soonest
                  </button>
                </div>
              </div>
            </div>

            <div className="md:hidden flex items-center bg-white border border-gray-300 rounded-full overflow-hidden mt-2">
              <input
                type="text"
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="px-4 py-2 text-sm border-none focus:outline-none flex-1"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-green-500 text-white hover:bg-green-600"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Trip List Section */}
          <div className="lg:w-1/2 space-y-4">
            {isPaginationLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : currentTrips.length > 0 ? (
              currentTrips.map((trip) => (
                <div
                  key={trip._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {/* Status Badge */}
                  <div className="relative">
                    <span
                      className={`absolute top-4 left-4 inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                        trip.status === "scheduled"
                          ? "bg-green-100 text-green-800"
                          : trip.status === "in-progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : trip.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {trip.status === "scheduled" && (
                        <Check size={12} className="mr-1" />
                      )}
                      {trip.status === "in-progress" && (
                        <Clock size={12} className="mr-1" />
                      )}
                      {trip.status === "completed" && (
                        <Check size={12} className="mr-1" />
                      )}
                      {trip.status === "cancelled" && (
                        <X size={12} className="mr-1" />
                      )}
                      {trip.status}
                    </span>
                    <span className="absolute top-4 right-4 text-xl font-bold text-white bg-green-500 px-3 py-1 rounded-full shadow-sm">
                      Rs{trip.price}
                    </span>
                  </div>

                  <div className="p-5 pt-14">
                    {/* Route Info */}
                    <div className="mb-4">
                      <div className="flex items-center text-gray-700 mb-2">
                        <MapPin
                          size={16}
                          className="mr-2 text-green-500 flex-shrink-0"
                        />
                        <span className="font-medium text-gray-900 mr-2">
                          {trip.departureLocation}
                        </span>
                        <ChevronRight
                          size={16}
                          className="mx-1 text-gray-400 flex-shrink-0"
                        />
                        <span className="font-medium text-gray-900">
                          {trip.destinationLocation}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {trip.vehicleDetails?.model || "Comfortable Journey"}
                        </h3>
                        {/* Posted time */}
                        <span className="text-xs text-gray-500">
                          {formatTimeSince(getTripDate(trip))}
                        </span>
                      </div>
                    </div>

                    {/* Trip Details Grid */}
                    <div className="grid grid-cols-3 gap-4 py-3 border-y border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Date</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(trip.departureDate)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Time</span>
                        <span className="font-medium text-gray-900">
                          {trip.departureTime}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">
                          Seats
                        </span>
                        <span className="font-medium text-gray-900">
                          {trip.availableSeats} available
                        </span>
                      </div>
                    </div>

                    {/* Driver Info & Actions */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {trip.driver?.name || "Experienced Driver"}
                          </p>
                          <div className="flex items-center">
                            {[...Array(4)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 text-yellow-400 fill-yellow-400"
                              />
                            ))}
                            <Star className="w-4 h-4 text-gray-300" />
                            <span className="ml-1 text-xs text-gray-500">
                              (4.0)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(trip)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                          title="View Details"
                        >
                          <Info size={18} />
                        </button>

                        {trip.driver?._id === user?._id ? (
                          <>
                            <button
                              onClick={() =>
                                handleStatusClick(trip._id, trip.status)
                              }
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors group relative"
                              title="Toggle Status"
                            >
                              <ToggleLeft size={18} />
                              <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {trip.status === "scheduled"
                                  ? "Cancel trip"
                                  : "Activate trip"}
                              </span>
                            </button>
                            <button
                              onClick={() => handleEditClick(trip)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors group relative"
                              title="Edit"
                            >
                              <Edit size={18} />
                              <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Edit trip
                              </span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(trip)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors group relative"
                              title="Delete"
                            >
                              <Trash size={18} />
                              <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Delete trip
                              </span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleBooking(trip)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                            disabled={trip.availableSeats < 1}
                          >
                            <Check size={16} className="mr-1.5" /> Book Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    No trips available
                  </h2>
                  <p className="text-gray-500 mb-6">
                    {statusFilter !== "all"
                      ? `No ${statusFilter} trips found. Try changing your filter.`
                      : "There are no trips available at the moment."}
                  </p>
                  {statusFilter !== "all" ? (
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      View All Trips
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/tripForm")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Plus size={18} className="mr-1.5" /> Create New Trip
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pagination */}
            {filteredTrips.length > tripsPerPage && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>

          {/* Map Section */}
          <div className="lg:w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-200px)] sticky top-32">
            <EnhancedGoogleMap
              trips={currentTrips}
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
              onLocationFound={(location) =>
                console.log("User location:", location)
              }
            />
          </div>
        </div>
      </main>

      {/* MODAL for "View Details" */}
      {selectedTrip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={closeDetailsModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-xl w-full relative animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-green-600 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-bold">Trip Details</h2>
              <p className="text-green-100 mt-1 flex items-center">
                <MapPin size={16} className="mr-1.5" />
                {selectedTrip.departureLocation} →{" "}
                {selectedTrip.destinationLocation}
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <Calendar size={14} className="mr-1.5" /> Date
                  </div>
                  <p className="text-gray-900 font-medium">
                    {formatDate(selectedTrip.departureDate)}
                  </p>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <Clock size={14} className="mr-1.5" /> Time
                  </div>
                  <p className="text-gray-900 font-medium">
                    {selectedTrip.departureTime}
                  </p>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <DollarSign size={14} className="mr-1.5" /> Price
                  </div>
                  <p className="text-gray-900 font-medium">
                    Rs{selectedTrip.price}
                  </p>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <User size={14} className="mr-1.5" /> Available Seats
                  </div>
                  <p className="text-gray-900 font-medium">
                    {selectedTrip.availableSeats}
                  </p>
                </div>
                <div className="space-y-4">
                  {selectedTrip.driver && (
                    <div>
                      <div className="flex items-center text-gray-500 text-sm mb-1">
                        <User size={14} className="mr-1.5" /> Driver
                      </div>
                      <p className="text-gray-900 font-medium">
                        {selectedTrip.driver.name}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {selectedTrip.driver.phoneNumber}
                      </p>
                    </div>
                  )}
                  {selectedTrip.vehicleDetails && (
                    <div>
                      <div className="flex items-center text-gray-500 text-sm mb-1">
                        <Car size={14} className="mr-1.5" /> Vehicle
                      </div>
                      <div className="text-gray-900">
                        <p className="font-medium">
                          {selectedTrip.vehicleDetails.model}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedTrip.vehicleDetails.color} ·{" "}
                          {selectedTrip.vehicleDetails.plateNumber}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Added: Trip Created Time */}
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <Clock size={14} className="mr-1.5" /> Posted
                    </div>
                    <p className="text-gray-900 font-medium">
                      {formatTimeSince(getTripDate(selectedTrip))}
                    </p>
                  </div>
                </div>
              </div>
              {selectedTrip.preferences && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-gray-700 font-medium mb-3">
                    Preferences
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <div
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedTrip.preferences.smoking
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedTrip.preferences.smoking
                        ? "Smoking Allowed"
                        : "No Smoking"}
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedTrip.preferences.pets
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedTrip.preferences.pets
                        ? "Pets Allowed"
                        : "No Pets"}
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedTrip.preferences.music
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedTrip.preferences.music
                        ? "Music in Car"
                        : "No Music"}
                    </div>
                  </div>
                </div>
              )}
              {selectedTrip.description && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-gray-700 font-medium mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600">{selectedTrip.description}</p>
                </div>
              )}
              <div className="mt-8 flex flex-wrap justify-end gap-3">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                >
                  <X size={16} className="mr-1.5" /> Close
                </button>
                {selectedTrip.driver?._id !== user?._id && (
                  <button
                    onClick={() => {
                      closeDetailsModal();
                      handleBooking(selectedTrip);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    disabled={selectedTrip.availableSeats < 1}
                  >
                    <Check size={16} className="mr-1.5" /> Book This Trip
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={closeDetailsModal}
              className="absolute top-4 right-4 text-white hover:text-green-100 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL for "Edit Trip" */}
      {editingTrip && editFormData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full relative animate-fade-in overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-green-600 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <h2 className="text-xl font-bold">Edit Trip</h2>
              <p className="text-green-100 mt-1 flex items-center">
                <MapPin size={16} className="mr-1.5" />
                {editFormData.departureLocation} →{" "}
                {editFormData.destinationLocation}
              </p>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <MapPin size={14} className="mr-1.5 text-gray-500" /> From
                    </label>
                    <input
                      type="text"
                      name="departureLocation"
                      value={editFormData.departureLocation}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Departure location"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <MapPin size={14} className="mr-1.5 text-gray-500" /> To
                    </label>
                    <input
                      type="text"
                      name="destinationLocation"
                      value={editFormData.destinationLocation}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Destination location"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Calendar size={14} className="mr-1.5 text-gray-500" />{" "}
                      Date
                    </label>
                    <input
                      type="date"
                      name="departureDate"
                      value={
                        editFormData.departureDate
                          ? editFormData.departureDate.split("T")[0]
                          : ""
                      }
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Clock size={14} className="mr-1.5 text-gray-500" /> Time
                    </label>
                    <input
                      type="time"
                      name="departureTime"
                      value={editFormData.departureTime}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <DollarSign size={14} className="mr-1.5 text-gray-500" />{" "}
                      Price (Rs)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        Rs
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditFormChange}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <User size={14} className="mr-1.5 text-gray-500" />{" "}
                      Available Seats
                    </label>
                    <input
                      type="number"
                      name="availableSeats"
                      value={editFormData.availableSeats}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      min="1"
                    />
                  </div>
                </div>
                {editFormData.vehicleDetails && (
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                      <Car size={16} className="mr-2 text-green-600" /> Vehicle
                      Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Model
                        </label>
                        <input
                          type="text"
                          name="vehicleDetails.model"
                          value={editFormData.vehicleDetails.model}
                          onChange={handleEditFormChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Color
                        </label>
                        <input
                          type="text"
                          name="vehicleDetails.color"
                          value={editFormData.vehicleDetails.color}
                          onChange={handleEditFormChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Plate Number
                        </label>
                        <input
                          type="text"
                          name="vehicleDetails.plateNumber"
                          value={editFormData.vehicleDetails.plateNumber}
                          onChange={handleEditFormChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {editFormData.preferences && (
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                      <Sliders size={16} className="mr-2 text-green-600" />{" "}
                      Preferences
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div
                        className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                          editFormData.preferences.smoking
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300"
                        }`}
                        onClick={() => {
                          setEditFormData({
                            ...editFormData,
                            preferences: {
                              ...editFormData.preferences,
                              smoking: !editFormData.preferences.smoking,
                            },
                          });
                        }}
                      >
                        <input
                          type="checkbox"
                          name="smoking"
                          checked={!!editFormData.preferences.smoking}
                          onChange={handleEditFormChange}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mr-3"
                        />
                        <span>Smoking Allowed</span>
                      </div>
                      <div
                        className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                          editFormData.preferences.pets
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300"
                        }`}
                        onClick={() => {
                          setEditFormData({
                            ...editFormData,
                            preferences: {
                              ...editFormData.preferences,
                              pets: !editFormData.preferences.pets,
                            },
                          });
                        }}
                      >
                        <input
                          type="checkbox"
                          name="pets"
                          checked={!!editFormData.preferences.pets}
                          onChange={handleEditFormChange}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mr-3"
                        />
                        <span>Pets Allowed</span>
                      </div>
                      <div
                        className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                          editFormData.preferences.music
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300"
                        }`}
                        onClick={() => {
                          setEditFormData({
                            ...editFormData,
                            preferences: {
                              ...editFormData.preferences,
                              music: !editFormData.preferences.music,
                            },
                          });
                        }}
                      >
                        <input
                          type="checkbox"
                          name="music"
                          checked={!!editFormData.preferences.music}
                          onChange={handleEditFormChange}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mr-3"
                        />
                        <span>Music in Car</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Info size={14} className="mr-1.5 text-gray-500" />{" "}
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description || ""}
                    onChange={handleEditFormChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Add any additional details about the trip..."
                  />
                </div>
                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <X size={16} className="mr-1.5" /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Save size={16} className="mr-1.5" /> Save Changes
                  </button>
                </div>
              </form>
            </div>
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-white hover:text-green-100 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center mb-4 text-red-600">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">Delete Trip</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this trip from{" "}
              {deleteConfirmation.departureLocation} to{" "}
              {deleteConfirmation.destinationLocation}? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <Trash size={16} className="mr-1.5" /> Delete Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Confirmation Modal */}
      {statusConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center mb-4 text-blue-600">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">Change Trip Status</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to change the trip status to{" "}
              <span className="font-medium">
                {statusConfirmation.newStatus}
              </span>
              ?
              {statusConfirmation.newStatus === "cancelled" && (
                <span className="block mt-2 text-sm text-red-600">
                  This will notify all passengers that the trip has been
                  cancelled.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStatusConfirmation(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Check size={16} className="mr-1.5" /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Confirmation Modal */}
      {updateConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center mb-4 text-green-600">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-semibold">Update Trip</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to update this trip? This will modify the
              trip details for all passengers.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUpdateConfirmation(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Save size={16} className="mr-1.5" /> Update Trip
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TripList;
