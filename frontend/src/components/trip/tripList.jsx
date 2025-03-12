import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteTrip,
  updateTrip,
  getTrips,
  getTripById,
  bookSeat,
} from "../Slices/tripSlice";
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
  List,
  ToggleLeft,
  ChevronRight,
  ArrowLeft,
  Plus,
  Save,
  Filter,
  Sliders,
  CheckCircle,
  XCircle,
} from "lucide-react";

const TripList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Auth user
  const { user } = useSelector((state) => state.auth) || {};

  const { trips = [], loading, error } = useSelector((state) => state.trip);

  // State for "View Details" modal
  const [selectedTrip, setSelectedTrip] = useState(null);

  // State for "Edit" modal
  const [editingTrip, setEditingTrip] = useState(null);

  // Local form data when editing
  const [editFormData, setEditFormData] = useState(null);

  // For filtering
  const [statusFilter, setStatusFilter] = useState("all");

  // For mobile view
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    dispatch(getTrips());

    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  // --- ACTION HANDLERS ---

  const handleDelete = async (tripId) => {
    try {
      await dispatch(deleteTrip(tripId)).unwrap();
      toast.success("Trip deleted successfully");
      dispatch(getTrips()); // refresh
    } catch (err) {
      toast.error(err?.message || "Failed to delete trip");
    }
  };

  const handleStatusUpdate = async (tripId, currentStatus) => {
    try {
      const newStatus =
        currentStatus === "scheduled" ? "cancelled" : "scheduled";
      await dispatch(
        updateTrip({ tripId, tripData: { status: newStatus } })
      ).unwrap();
      toast.success(`Trip status updated to "${newStatus}"`);
      dispatch(getTrips());
    } catch (err) {
      toast.error(err?.message || "Failed to update status");
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
      // If you need fresh data from server:
      await dispatch(getTripById(trip._id)).unwrap();
      // But we can also just use the trip object if the store is up-to-date
      setEditingTrip(trip);
      // Initialize local form state
      setEditFormData({ ...trip });
    } catch (err) {
      toast.error("Failed to fetch trip details");
    }
  };

  const closeEditModal = () => {
    setEditingTrip(null);
    setEditFormData(null);
  };

  // Submit updated fields to the backend
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTrip || !editFormData) return;

    try {
      await dispatch(
        updateTrip({
          tripId: editingTrip._id,
          tripData: editFormData,
        })
      ).unwrap();
      toast.success("Trip updated successfully");
      // close the edit modal
      closeEditModal();
      // refresh
      dispatch(getTrips());
    } catch (err) {
      toast.error(err?.message || "Failed to update trip");
    }
  };

  // EDIT FORM FIELD CHANGE
  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => {
      if (!prev) return prev;

      if (type === "checkbox") {
        // updating preferences
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

  const handleBookRide = async (tripId) => {
    try {
      await dispatch(bookSeat(tripId)).unwrap();
      toast.success("Seat booked successfully");
      dispatch(getTrips()); // so the seat count is updated
    } catch (err) {
      toast.error(err?.message || "Failed to book ride");
    }
  };
  

  // Filter trips by status
  const filteredTrips =
    statusFilter === "all"
      ? trips
      : trips.filter((trip) => trip.status === statusFilter);

  // Format date
  const formatDate = (dateString) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // --- RENDERING ---

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
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Trip Listings
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status filter */}
              <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    statusFilter === "all"
                      ? "bg-green-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("scheduled")}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    statusFilter === "scheduled"
                      ? "bg-green-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Scheduled
                </button>
                <button
                  onClick={() => setStatusFilter("cancelled")}
                  className={`px-3 py-1.5 text-sm font-medium ${
                    statusFilter === "cancelled"
                      ? "bg-green-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Cancelled
                </button>
              </div>

              <button
                onClick={() => navigate("/trips/new")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center"
              >
                <Plus size={18} className="mr-1" /> New Trip
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrips.map((trip) => {
              // Decide classes for status label
              let statusClasses = "bg-red-100 text-red-800";
              let statusIcon = <X size={14} className="mr-1" />;

              if (trip.status === "scheduled") {
                statusClasses = "bg-green-100 text-green-800";
                statusIcon = <Check size={14} className="mr-1" />;
              } else if (trip.status === "in-progress") {
                statusClasses = "bg-yellow-100 text-yellow-800";
                statusIcon = <Clock size={14} className="mr-1" />;
              } else if (trip.status === "completed") {
                statusClasses = "bg-blue-100 text-blue-800";
                statusIcon = <Check size={14} className="mr-1" />;
              }

              const isDriver = trip.driver?._id === user?._id;

              return (
                <div
                  key={trip._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-1">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusClasses}`}
                          >
                            {statusIcon} {trip.status}
                          </span>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800 mt-1">
                          {trip.departureLocation}
                          <ChevronRight
                            size={16}
                            className="inline mx-1 text-gray-400"
                          />
                          {trip.destinationLocation}
                        </h2>
                      </div>

                      {/* Price Badge */}
                      {trip.price !== undefined && (
                        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-lg font-medium">
                          ₹{trip.price}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2 text-gray-500" />
                        <span>{formatDate(trip.departureDate)}</span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Clock size={16} className="mr-2 text-gray-500" />
                        <span>{trip.departureTime}</span>
                      </div>

                      {trip.availableSeats !== undefined && (
                        <div className="flex items-center text-gray-600">
                          <User size={16} className="mr-2 text-gray-500" />
                          <span>
                            {trip.availableSeats} seat
                            {trip.availableSeats !== 1 ? "s" : ""} available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2 justify-end">
                      {/* View Details button */}
                      <button
                        onClick={() => handleViewDetails(trip)}
                        className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                      >
                        <Info size={16} className="mr-1.5" /> Details
                      </button>

                      {/* Driver-specific actions */}
                      {isDriver ? (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(trip._id, trip.status)
                            }
                            className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                          >
                            <ToggleLeft size={16} className="mr-1.5" /> Toggle
                            Status
                          </button>
                          <button
                            onClick={() => handleEditClick(trip)}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                          >
                            <Edit size={16} className="mr-1.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(trip._id)}
                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                          >
                            <Trash size={16} className="mr-1.5" /> Delete
                          </button>
                        </>
                      ) : (
                        // Book Ride button for non-drivers
                        <button
                          onClick={() => handleBookRide(trip._id)}
                          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <Check size={16} className="mr-1.5" /> Book Ride
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
                  onClick={() => navigate("/trips/new")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Plus size={18} className="mr-1.5" /> Create New Trip
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL for "View Details" */}
      {selectedTrip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={closeDetailsModal}
        >
          {/* Stop click from bubbling to background */}
          <div
            className="bg-white rounded-xl shadow-xl max-w-xl w-full relative animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-green-600 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-bold">Trip Details</h2>
              <p className="text-green-100 mt-1 flex items-center">
                <MapPin size={16} className="mr-1.5" />
                {selectedTrip.departureLocation} →{" "}
                {selectedTrip.destinationLocation}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <Calendar size={14} className="mr-1.5" /> Date
                    </div>
                    <p className="text-gray-900 font-medium">
                      {formatDate(selectedTrip.departureDate)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <Clock size={14} className="mr-1.5" /> Time
                    </div>
                    <p className="text-gray-900 font-medium">
                      {selectedTrip.departureTime}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <DollarSign size={14} className="mr-1.5" /> Price
                    </div>
                    <p className="text-gray-900 font-medium">
                      ₹{selectedTrip.price}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <User size={14} className="mr-1.5" /> Available Seats
                    </div>
                    <p className="text-gray-900 font-medium">
                      {selectedTrip.availableSeats}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Driver Info */}
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

                  {/* Vehicle Details */}
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
                </div>
              </div>

              {/* Preferences */}
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

              {/* Description */}
              {selectedTrip.description && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-gray-700 font-medium mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600">{selectedTrip.description}</p>
                </div>
              )}

              {/* Buttons at the bottom */}
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
                      handleBookRide(selectedTrip._id);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Check size={16} className="mr-1.5" /> Book This Trip
                  </button>
                )}
              </div>
            </div>

            {/* "X" close icon top-right */}
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
            {/* Modal Header */}
            <div className="bg-green-600 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <h2 className="text-xl font-bold">Edit Trip</h2>
              <p className="text-green-100 mt-1 flex items-center">
                <MapPin size={16} className="mr-1.5" />
                {editFormData.departureLocation} →{" "}
                {editFormData.destinationLocation}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* departureLocation */}
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

                  {/* destinationLocation */}
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

                  {/* departureDate */}
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

                  {/* departureTime */}
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

                  {/* price */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <DollarSign size={14} className="mr-1.5 text-gray-500" />{" "}
                      Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ₹
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

                  {/* availableSeats */}
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

                {/* Vehicle details */}
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

                {/* Preferences */}
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

                {/* description */}
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

            {/* "X" close icon top-right */}
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
    </div>
  );
};

export default TripList;
