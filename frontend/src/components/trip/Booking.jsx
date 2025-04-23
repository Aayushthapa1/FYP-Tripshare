import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { getTripById } from "../Slices/tripSlice";
import {
  createBooking,
  fetchMyBookings,
  fetchDriverPendingBookings,
  fetchDriverBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
  clearActionSuccess,
  clearBookingError,
} from "../Slices/bookingSlice";
import { initiatePayment } from "../Slices/paymentSlice";

import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  User,
  Car,
  Check,
  X,
  ChevronLeft,
  ArrowLeft,
  TrendingUp,
  CreditCard,
  Banknote,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

const Booking = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tripId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const bookingId = queryParams.get("bookingId");

  // Get auth user
  const { user } = useSelector((state) => state.auth) || {};
  const isDriver = user?.role === "driver";

  // Get trip and booking details from Redux state
  const {
    loading: tripLoading,
    error: tripError,
    currentTrip,
  } = useSelector((state) => state.trip);
  const {
    loading: bookingLoading,
    error: bookingError,
    actionSuccess,
    myBookings,
    driverBookings,
    pendingBookings,
    currentBooking,
  } = useSelector((state) => state.booking);

  // Local state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");
  const [seats, setSeats] = useState(1);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [viewMode, setViewMode] = useState(bookingId ? "details" : "create");
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Fetch trip details on mount if in create mode
  useEffect(() => {
    if (viewMode === "create" && tripId) {
      dispatch(getTripById(tripId));
    }
  }, [dispatch, tripId, viewMode]);

  // If in view/details mode, fetch bookings for user or driver
  useEffect(() => {
    if (viewMode === "details") {
      if (isDriver) {
        dispatch(fetchDriverPendingBookings());
        dispatch(fetchDriverBookings());
      } else {
        dispatch(fetchMyBookings());
      }
    }
  }, [dispatch, viewMode, isDriver]);

  // Handle booking success
  useEffect(() => {
    if (actionSuccess) {
      toast.success("Action Completed", {
        description: "Your booking action was processed successfully!",
      });

      // Refresh bookings in redux state
      if (isDriver) {
        dispatch(fetchDriverPendingBookings());
        dispatch(fetchDriverBookings());
      } else {
        dispatch(fetchMyBookings());
      }

      // Show confirmation for booking creation
      if (viewMode === "create") {
        setShowConfirmation(true);
      }

      // Close modals if open
      setShowRejectionModal(false);
      setRejectionReason("");

      // Clear success flag after processing
      dispatch(clearActionSuccess());
    }
  }, [actionSuccess, dispatch, viewMode, isDriver]);

  // Handle booking error
  useEffect(() => {
    if (bookingError) {
      toast.error("Action Failed", {
        description:
          bookingError || "Failed to process booking action. Please try again.",
      });
      setIsProcessingPayment(false);
      dispatch(clearBookingError());
    }
  }, [bookingError, dispatch]);

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

  // Calculate total price
  const calculateTotal = () => {
    if (viewMode === "details" && currentBooking) {
      // When viewing booking details
      const tripPrice = currentBooking.trip?.price || 0;
      return tripPrice * currentBooking.seatsBooked;
    } else if (viewMode === "details" && booking) {
      // When viewing booking details from list
      const tripPrice = booking.trip?.price || 0;
      return tripPrice * booking.seatsBooked;
    } else if (currentTrip) {
      // When creating booking
      return currentTrip.price * seats;
    }
    return 0;
  };

  // Process a new booking
  const processBooking = async () => {
    try {
      setIsProcessingPayment(true);

      if (selectedPaymentMethod === "online") {
        // For online payments, initiate payment
        const paymentResponse = await dispatch(
          initiatePayment({
            userId: user._id,
            tripId: tripId,
            seats: seats,
            amount: calculateTotal(),
            bookingType: "trip",
          })
        ).unwrap();

        if (paymentResponse?.Result?.payment_url) {
          // Instead of redirecting, show the payment URL in a modal
          setPaymentUrl(paymentResponse.Result.payment_url);
          setShowPaymentModal(true);
          setIsProcessingPayment(false);
        } else {
          throw new Error("No payment URL received");
        }
      } else {
        // For COD, create the booking immediately
        const bookingData = {
          tripId: tripId,
          seats: seats,
          paymentMethod: "COD",
        };

        await dispatch(createBooking(bookingData)).unwrap();
        setIsProcessingPayment(false);
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Booking Failed", {
        description: err?.message || "Failed to book trip",
      });
      setIsProcessingPayment(false);
    }
  };

  // Driver: Accept a booking
  const handleAcceptBooking = async (id) => {
    if (window.confirm("Are you sure you want to accept this booking?")) {
      try {
        await dispatch(acceptBooking(id || bookingId)).unwrap();
        toast.success("Booking accepted successfully!");
      } catch (error) {
        console.error("Accept booking error:", error);
        toast.error("Failed to accept booking", {
          description: error?.message || "An error occurred",
        });
      }
    }
  };

  // Driver: Reject a booking (open modal)
  const handleRejectClick = (id) => {
    setShowRejectionModal(true);
  };

  // Driver: Submit rejection with reason
  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await dispatch(
        rejectBooking({
          bookingId: bookingId,
          reason: rejectionReason,
        })
      ).unwrap();

      setShowRejectionModal(false);
      setRejectionReason("");
      toast.success("Booking rejected successfully!");
    } catch (error) {
      console.error("Reject booking error:", error);
      toast.error("Failed to reject booking", {
        description: error?.message || "An error occurred",
      });
    }
  };

  // Driver: Complete a booking
  const handleCompleteBooking = async (id) => {
    if (
      window.confirm("Are you sure you want to mark this booking as completed?")
    ) {
      try {
        await dispatch(completeBooking(id || bookingId)).unwrap();
        toast.success("Booking marked as completed!");
      } catch (error) {
        console.error("Complete booking error:", error);
        toast.error("Failed to complete booking", {
          description: error?.message || "An error occurred",
        });
      }
    }
  };

  // User: Cancel a booking
  const handleCancelBooking = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await dispatch(cancelBooking(id || bookingId)).unwrap();
        toast.success("Booking cancelled successfully!");
      } catch (error) {
        console.error("Cancel booking error:", error);
        toast.error("Failed to cancel booking", {
          description: error?.message || "An error occurred",
        });
      }
    }
  };

  // Handle go back
  const handleGoBack = () => {
    navigate(-1);
  };

  // Return to trip listings
  const goToTrips = () => {
    navigate("/trips");
  };

  // Go to my bookings
  const goToMyBookings = () => {
    navigate("/mybookings");
  };

  // Render loading state
  if (
    (tripLoading && viewMode === "create") ||
    (bookingLoading && viewMode === "details")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">
            {viewMode === "create"
              ? "Loading trip details..."
              : "Loading booking details..."}
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (
    (tripError && viewMode === "create") ||
    (bookingError && viewMode === "details")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {viewMode === "create"
                ? "Error Loading Trip"
                : "Error Loading Booking"}
            </h2>
            <p className="text-center text-gray-600 mb-6">
              {tripError || bookingError}
            </p>
            <button
              onClick={handleGoBack}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If trip not found in create mode
  if (viewMode === "create" && !currentTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Trip Not Found
            </h2>
            <p className="text-center text-gray-600 mb-6">
              The trip you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/trips")}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Trip Listings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get booking for details mode
  const booking =
    currentBooking ||
    (bookingId && myBookings?.find((b) => b._id === bookingId)) ||
    (bookingId && driverBookings?.find((b) => b._id === bookingId)) ||
    (bookingId && pendingBookings?.find((b) => b._id === bookingId));

  // If booking not found in details mode
  if (viewMode === "details" && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Booking Not Found
            </h2>
            <p className="text-center text-gray-600 mb-6">
              The booking you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() =>
                isDriver
                  ? navigate("/driver/bookings")
                  : navigate("/my-bookings")
              }
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render confirmation screen after successful booking
  if (showConfirmation) {
    const trip = currentTrip;

    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Toaster position="top-right" richColors />

        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-green-600 p-8 text-white">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Check className="w-10 h-10" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-center">
                Booking Confirmed!
              </h1>
              <p className="text-center text-green-100 mt-2">
                Your trip has been booked successfully
              </p>
            </div>

            <div className="p-8">
              <div className="border-b border-gray-200 pb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Trip Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">From</p>
                        <p className="font-medium">{trip.departureLocation}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">To</p>
                        <p className="font-medium">
                          {trip.destinationLocation}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">
                          {formatDate(trip.departureDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium">{trip.departureTime}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 py-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Booking Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <p className="text-gray-600">Seats booked</p>
                    <p className="font-medium">{seats}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600">Price per seat</p>
                    <p className="font-medium">Rs{trip.price}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600">Payment method</p>
                    <p className="font-medium">
                      {selectedPaymentMethod === "COD"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </p>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <p>Total</p>
                    <p>Rs{calculateTotal()}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <p className="text-center text-gray-600">
                  An email with your booking details has been sent to your email
                  address.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={goToMyBookings}
                    className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    View My Bookings
                  </button>
                  <button
                    onClick={goToTrips}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    Browse More Trips
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  // Booking creation view
  if (viewMode === "create") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Toaster position="top-right" richColors />

        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <button
                onClick={handleGoBack}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Book Your Trip
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Trip Info Section */}
            <div className="bg-green-600 p-6 text-white">
              <h2 className="text-xl font-bold mb-2">Trip Details</h2>
              <div className="flex items-center text-green-100">
                <MapPin size={16} className="mr-1.5" />
                <span className="mr-2">{currentTrip.departureLocation}</span>
                <TrendingUp size={16} className="mx-1" />
                <span>{currentTrip.destinationLocation}</span>
              </div>
            </div>

            <div className="p-6">
              {/* Trip Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <Calendar size={14} className="mr-1.5" /> Date
                    </div>
                    <p className="text-gray-900 font-medium">
                      {formatDate(currentTrip.departureDate)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <Clock size={14} className="mr-1.5" /> Time
                    </div>
                    <p className="text-gray-900 font-medium">
                      {currentTrip.departureTime}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <User size={14} className="mr-1.5" /> Available Seats
                    </div>
                    <p className="text-gray-900 font-medium">
                      {currentTrip.availableSeats}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <DollarSign size={14} className="mr-1.5" /> Price per Seat
                    </div>
                    <p className="text-gray-900 font-medium">
                      Rs{currentTrip.price}
                    </p>
                  </div>

                  {currentTrip.driver && (
                    <div>
                      <div className="flex items-center text-gray-500 text-sm mb-1">
                        <User size={14} className="mr-1.5" /> Driver
                      </div>
                      <p className="text-gray-900 font-medium">
                        {currentTrip.driver.name}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {currentTrip.driver.phoneNumber}
                      </p>
                    </div>
                  )}

                  {currentTrip.vehicleDetails && (
                    <div>
                      <div className="flex items-center text-gray-500 text-sm mb-1">
                        <Car size={14} className="mr-1.5" /> Vehicle
                      </div>
                      <p className="text-gray-900 font-medium">
                        {currentTrip.vehicleDetails.model}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {currentTrip.vehicleDetails.color} ·{" "}
                        {currentTrip.vehicleDetails.plateNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Booking Details
                </h3>

                {/* Seats Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Seats
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setSeats((prev) => Math.max(1, prev - 1))}
                      className="p-2 border border-gray-300 rounded-l-lg hover:bg-gray-100 transition-colors"
                      disabled={seats <= 1}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>

                    <div className="px-4 py-2 w-16 text-center border-t border-b border-gray-300">
                      {seats}
                    </div>

                    <button
                      onClick={() =>
                        setSeats((prev) =>
                          Math.min(currentTrip.availableSeats, prev + 1)
                        )
                      }
                      className="p-2 border border-gray-300 rounded-r-lg hover:bg-gray-100 transition-colors"
                      disabled={seats >= currentTrip.availableSeats}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>

                    <p className="ml-4 text-sm text-gray-500">
                      {currentTrip.availableSeats} seats available
                    </p>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">
                    Select Payment Method:
                  </h4>

                  <div className="space-y-3">
                    {/* COD Option */}
                    <div
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPaymentMethod === "COD"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedPaymentMethod("COD")}
                    >
                      <div className="mr-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPaymentMethod === "COD"
                              ? "border-green-500"
                              : "border-gray-400"
                          }`}
                        >
                          {selectedPaymentMethod === "COD" && (
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <Banknote className="h-6 w-6 text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">
                          Pay directly to the driver
                        </p>
                      </div>
                    </div>

                    {/* Online Payment Option */}
                    <div
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPaymentMethod === "online"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedPaymentMethod("online")}
                    >
                      <div className="mr-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedPaymentMethod === "online"
                              ? "border-green-500"
                              : "border-gray-400"
                          }`}
                        >
                          {selectedPaymentMethod === "online" && (
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <CreditCard className="h-6 w-6 text-gray-500 mr-3" />
                      <div>
                        <p className="font-medium">Online Payment</p>
                        <p className="text-sm text-gray-500">
                          Pay via Khalti, eSewa, or other methods
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Order Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per seat</span>
                      <span>Rs{currentTrip.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Number of seats</span>
                      <span>{seats}</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between font-bold">
                      <span>Total</span>
                      <span>Rs{calculateTotal()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    onClick={handleGoBack}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                    disabled={isProcessingPayment}
                  >
                    <X size={16} className="mr-1.5" /> Cancel
                  </button>

                  <button
                    onClick={processBooking}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    disabled={isProcessingPayment || bookingLoading}
                  >
                    {isProcessingPayment || bookingLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check size={16} className="mr-1.5" /> Confirm Booking
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Complete Your Payment</h3>
              <p className="mb-6">
                Click the button below to proceed to the payment gateway to
                complete your booking.
              </p>
              <div className="flex justify-between">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Proceed to Payment
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Reject Booking</h3>
              <p className="mb-2">
                Please provide a reason for rejecting this booking:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-4 h-32"
                placeholder="Type reason here..."
              />
              <div className="flex justify-between">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  disabled={!rejectionReason.trim()}
                >
                  Reject Booking
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    );
  }

  // Booking details view (for viewing a specific booking)
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={handleGoBack}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {isDriver ? "Booking Management" : "Booking Details"}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Status Banner */}
          <div className={`p-4 ${getStatusColor(booking.status)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getStatusIcon(booking.status)}
                <span className="font-medium ml-2 capitalize">
                  {booking.status}
                </span>
              </div>
              <span className="text-sm">Booking ID: {booking._id}</span>
            </div>
          </div>

          <div className="p-6">
            {/* Trip Details */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Trip Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <MapPin size={14} className="mr-1.5" /> From
                    </div>
                    <p className="text-gray-900 font-medium">
                      {booking.trip?.departureLocation}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <MapPin size={14} className="mr-1.5" /> To
                    </div>
                    <p className="text-gray-900 font-medium">
                      {booking.trip?.destinationLocation}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <Calendar size={14} className="mr-1.5" /> Date
                    </div>
                    <p className="text-gray-900 font-medium">
                      {formatDate(booking.trip?.departureDate)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <Clock size={14} className="mr-1.5" /> Time
                    </div>
                    <p className="text-gray-900 font-medium">
                      {booking.trip?.departureTime}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <User size={14} className="mr-1.5" />
                      {isDriver ? "Passenger" : "Driver"}
                    </div>
                    <p className="text-gray-900 font-medium">
                      {isDriver
                        ? booking.user?.fullName
                        : booking.trip?.driver?.name}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {isDriver
                        ? booking.user?.phoneNumber
                        : booking.trip?.driver?.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <Car size={14} className="mr-1.5" /> Vehicle
                    </div>
                    <p className="text-gray-900 font-medium">
                      {booking.trip?.vehicleDetails?.model}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {booking.trip?.vehicleDetails?.color} ·{" "}
                      {booking.trip?.vehicleDetails?.plateNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Booking Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <User size={14} className="mr-1.5" /> Seats Booked
                    </div>
                    <p className="text-gray-900 font-medium">
                      {booking.seatsBooked}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <CreditCard size={14} className="mr-1.5" /> Payment Method
                    </div>
                    <p className="text-gray-900 font-medium">
                      {booking.paymentMethod === "COD"
                        ? "Cash on Delivery"
                        : "Online Payment"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <DollarSign size={14} className="mr-1.5" /> Total Amount
                    </div>
                    <p className="text-gray-900 font-medium">
                      Rs{calculateTotal()}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-1">
                      <AlertCircle size={14} className="mr-1.5" /> Payment
                      Status
                    </div>
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                        booking.paymentStatus
                      )}`}
                    >
                      {booking.paymentStatus}
                    </div>
                  </div>
                </div>
              </div>

              {/* Show rejection reason if applicable */}
              {booking.status === "cancelled" && booking.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">
                    Cancellation Reason:
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {booking.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {/* Actions based on role and booking status */}
            <div className="pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Actions
              </h2>

              <div className="flex flex-wrap gap-3">
                {/* Driver Actions */}
                {isDriver && (
                  <>
                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAcceptBooking(booking._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                        >
                          <CheckCircle size={16} className="mr-1.5" /> Accept
                          Booking
                        </button>
                        <button
                          onClick={() => handleRejectClick(booking._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                        >
                          <XCircle size={16} className="mr-1.5" /> Reject
                          Booking
                        </button>
                      </>
                    )}

                    {booking.status === "booked" && (
                      <button
                        onClick={() => handleCompleteBooking(booking._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Check size={16} className="mr-1.5" /> Mark as Completed
                      </button>
                    )}
                  </>
                )}

                {/* Passenger Actions */}
                {!isDriver && (
                  <>
                    {(booking.status === "pending" ||
                      booking.status === "booked") && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                      >
                        <X size={16} className="mr-1.5" /> Cancel Booking
                      </button>
                    )}

                    {booking.status === "completed" && (
                      <button
                        onClick={goToTrips}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <MapPin size={16} className="mr-1.5" /> Browse More
                        Trips
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={handleGoBack}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                >
                  <ArrowLeft size={16} className="mr-1.5" /> Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Reject Booking</h3>
            <p className="mb-2">
              Please provide a reason for rejecting this booking:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4 h-32"
              placeholder="Type reason here..."
            />
            <div className="flex justify-between">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={!rejectionReason.trim()}
              >
                Reject Booking
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

// Helper functions for status and payment styling
function getStatusColor(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-50 text-yellow-800 border-b border-yellow-100";
    case "booked":
      return "bg-green-50 text-green-800 border-b border-green-100";
    case "completed":
      return "bg-blue-50 text-blue-800 border-b border-blue-100";
    case "cancelled":
      return "bg-red-50 text-red-800 border-b border-red-100";
    default:
      return "bg-gray-50 text-gray-800 border-b border-gray-100";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "pending":
      return <Clock size={18} className="text-yellow-600" />;
    case "booked":
      return <Check size={18} className="text-green-600" />;
    case "completed":
      return <CheckCircle size={18} className="text-blue-600" />;
    case "cancelled":
      return <X size={18} className="text-red-600" />;
    default:
      return <Info size={18} className="text-gray-600" />;
  }
}

function getPaymentStatusColor(status) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "paid":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default Booking;
