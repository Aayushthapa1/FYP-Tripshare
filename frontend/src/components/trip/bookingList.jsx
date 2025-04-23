import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyBookings, cancelBooking } from "../Slices/bookingSlice";
import { Toaster, toast } from "sonner";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  User,
  Car,
  Phone,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronLeft,
  Filter,
  Loader,
  Info,
} from "lucide-react";
import socketService from "../socket/socketService";

const BookingList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth) || {};
  const { myBookings, loading } = useSelector((state) => state.booking) || { myBookings: [] };
  
  // State for filter
  const [statusFilter, setStatusFilter] = useState("all");
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  // Set up socket connection
  useEffect(() => {
    if (!socketService.connected) {
      socketService.connect();
    }
    
    const socket = socketService.getSocket();
    
    if (socket) {
      setSocketConnected(socket.connected);
      
      socket.on("connect", () => {
        setSocketConnected(true);
      });
      
      socket.on("disconnect", () => {
        setSocketConnected(false);
      });
      
      socket.on("booking_status_changed", (data) => {
        toast.info(`Booking status updated to ${data.status}`);
        // Refresh bookings after status change
        dispatch(fetchMyBookings());
      });
    }
    
    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("booking_status_changed");
      }
    };
  }, [dispatch]);

  // Fetch bookings on component mount
  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time function
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  // Handle booking cancellation
  const handleCancelBooking = () => {
    if (!bookingToCancel || !cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    dispatch(
      cancelBooking({
        bookingId: bookingToCancel._id,
        cancelReason: cancelReason,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Booking cancelled successfully");
        setShowConfirmCancel(false);
        setBookingToCancel(null);
        setCancelReason("");
        dispatch(fetchMyBookings());
        
        // Emit socket event for real-time update
        if (socketService.connected) {
          socketService.socket.emit("booking_cancelled", {
            bookingId: bookingToCancel._id,
            userId: user?._id,
            status: "cancelled",
            cancelReason: cancelReason
          });
        }
      })
      .catch((error) => {
        toast.error(error.message || "Failed to cancel booking");
      });
  };

  // Filter bookings by status
  const filteredBookings = myBookings.filter((booking) => {
    if (statusFilter === "all") return true;
    return booking.status === statusFilter;
  });

  // Get status badge component
  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center">
            <CheckCircle size={12} className="mr-1" /> Confirmed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center">
            <XCircle size={12} className="mr-1" /> Cancelled
          </span>
        );
      case "pending":
        return (
          <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center">
            <Clock size={12} className="mr-1" /> Pending
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center">
            <CheckCircle size={12} className="mr-1" /> Completed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <>
      <Navbar />
      <Toaster position="top-center" richColors />

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
              <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
            </div>

            {/* Socket status indicator */}
            <div className={`flex items-center text-sm ${socketConnected ? 'text-green-600' : 'text-red-500'}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${socketConnected ? 'bg-green-600' : 'bg-red-500'}`}></div>
              <span className="hidden md:inline">{socketConnected ? 'Real-time updates active' : 'Offline mode'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={16} className="text-gray-500 mr-1" />
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("confirmed")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === "confirmed"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === "completed"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter("cancelled")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === "cancelled"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No bookings found
              </h2>
              <p className="text-gray-500 mb-6">
                {statusFilter !== "all"
                  ? `You don't have any ${statusFilter} bookings.`
                  : "You haven't made any bookings yet."}
              </p>
              <button
                onClick={() => navigate("/trips")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Find Rides
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                {/* Status Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                      Booking #{booking._id.substring(booking._id.length - 6)}
                    </span>
                    {getStatusBadge(booking.status)}
                  </div>
                  <span className="text-sm text-gray-500">
                    Booked on {formatDate(booking.createdAt)}
                  </span>
                </div>

                {/* Booking Content */}
                <div className="p-4">
                  {/* Trip Details */}
                  {booking.trip && (
                    <div className="mb-6">
                      <div className="flex items-center mb-3">
                        <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">
                              {booking.trip.departureLocation}
                            </span>
                            <span className="mx-2 text-gray-400">→</span>
                            <span className="font-medium">
                              {booking.trip.destinationLocation}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Trip Date: {formatDate(booking.trip.departureDate)} at{" "}
                            {formatTime(booking.trip.departureTime)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-3 rounded-lg">
                        <div>
                          <div className="text-xs text-gray-500">Seats</div>
                          <div className="font-medium">
                            {booking.seats || 1} passenger{booking.seats > 1 ? "s" : ""}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Amount</div>
                          <div className="font-medium">
                            NPR {booking.amount || booking.trip.price * (booking.seats || 1)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Payment</div>
                          <div className="font-medium">
                            {booking.paymentMethod || "Cash"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Payment Status</div>
                          <div className="font-medium">
                            {booking.paymentStatus || "Pending"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Driver Info */}
                  {booking.trip?.driver && (
                    <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">
                            {booking.trip.driver.fullName || "Driver Name"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.trip.vehicleDetails?.model || "Vehicle"} •{" "}
                            {booking.trip.vehicleDetails?.color || ""}{" "}
                            {booking.trip.vehicleDetails?.plateNumber || ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {booking.trip.driver.phoneNumber && (
                          <a
                            href={`tel:${booking.trip.driver.phoneNumber}`}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                          >
                            <Phone size={20} />
                          </a>
                        )}
                        <Link
                          to={`/chats/${booking.trip._id}`}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full"
                        >
                          <MessageSquare size={20} />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="border-t border-gray-100 pt-4 mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => navigate(`/trips/${booking.trip?._id}`)}
                      className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                    >
                      <Info size={16} className="mr-1.5" /> View Details
                    </button>

                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => {
                          setBookingToCancel(booking);
                          setShowConfirmCancel(true);
                        }}
                        className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center"
                      >
                        <XCircle size={16} className="mr-1.5" /> Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showConfirmCancel && bookingToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Cancel Booking</h3>
            <p className="mb-4">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Please provide a reason for cancellation"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmCancel(false);
                  setBookingToCancel(null);
                  setCancelReason("");
                }}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default BookingList;