import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBooking } from "../Slices/bookingSlice";
import {
  initiatePayment,
  extractKhaltiCallbackParams,
  clearPaymentState,
} from "../Slices/paymentSlice";
import { toast } from "sonner";
import {
  CreditCard,
  DollarSign,
  Info,
  MapPin,
  Calendar,
  User,
  Car,
  X,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const BookingConfirmationModal = ({ trip, onClose }) => {
  const dispatch = useDispatch();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [booking, setBooking] = useState(null);
  const [showTripInfo, setShowTripInfo] = useState(false);
  const [paymentStep, setPaymentStep] = useState("select"); // select, processing, success, error
  const [paymentData, setPaymentData] = useState(null);

  // Get loading, error, and payment URL states from Redux
  const { loading, error, paymentUrl, currentPayment } = useSelector(
    (state) => state.payment
  );

  // Reset error when changing payment method
  useEffect(() => {
    if (error) {
      dispatch(clearPaymentState());
    }
  }, [paymentMethod, error, dispatch]);

  // Handle Khalti redirect if payment URL is available
  useEffect(() => {
    if (paymentUrl && paymentMethod === "khalti") {
      window.location.href = paymentUrl;
    }
  }, [paymentUrl, paymentMethod]);

  // Check for Khalti callback parameters on component mount
  useEffect(() => {
    const params = extractKhaltiCallbackParams();
    if (params.pidx && params.status) {
      // Handle Khalti callback
      // You might want to verify the payment status here
      if (params.status === "Completed") {
        setPaymentStep("success");
        toast.success("Payment completed successfully!");
      } else {
        setPaymentStep("error");
        toast.error(`Payment ${params.status.toLowerCase()}`);
      }
    }
  }, []);

  // Map UI payment methods to backend expected values
  const getBackendPaymentMethod = (uiMethod) => {
    if (uiMethod === "COD") return "COD";
    if (uiMethod === "khalti") return "khalti";
    if (uiMethod === "esewa") return "esewa";
    if (uiMethod === "banking") return "bank_transfer";
    return "online";
  };

  const handleConfirmBooking = async () => {
    try {
      const response = await dispatch(
        createBooking({
          tripId: trip._id,
          seats: 1,
          paymentMethod: getBackendPaymentMethod(paymentMethod), // Ensures correct format for backend
        })
      ).unwrap();
  
      setBooking(response); // The API returns the booking object directly
  
      if (paymentMethod === "COD") {
        toast.success("Booking confirmed! Pay at the time of the trip.");
        onClose();
      } else {
        toast.success(`Booking created! Proceeding with ${paymentMethod} payment.`);
        setPaymentStep("processing");
  
        // Prepare payment data for online transactions
        setPaymentData({
          bookingId: response._id, // Ensure correct property name
          paymentMethod: getBackendPaymentMethod(paymentMethod),
        });
      }
    } catch (err) {
      toast.error(err?.message || "Failed to book ride");
    }
  };
  

  const handlePaymentProcess = async () => {
    if (!paymentData || !booking) {
      toast.error("Payment data is missing. Please try again.");
      return;
    }

    try {
      // Initiate payment with our backend
      const response = await dispatch(initiatePayment(paymentData)).unwrap();

      // For Khalti, the backend will return a payment_url to redirect to
      if (paymentMethod === "khalti" && response.payment_url) {
        // The redirect will happen automatically via the useEffect above
        toast.info("Redirecting to Khalti payment page...");
      } else if (paymentMethod === "esewa" && response.payment_url) {
        // Similar for eSewa
        window.location.href = response.payment_url;
      } else if (paymentMethod === "banking") {
        // For banking, we might just show success or further instructions
        setPaymentStep("success");
        toast.success("Payment initiated successfully!");
      } else {
        // For other methods or if no redirect URL
        setPaymentStep("success");
        toast.success("Payment processed successfully!");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStep("error");
      toast.error(
        error?.message || "Payment processing failed. Please try again."
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Render payment success screen
  const renderPaymentSuccess = () => (
    <div className="flex flex-col items-center py-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        Payment Successful!
      </h3>
      <p className="text-gray-600 text-center mb-6">
        Your booking has been confirmed and payment has been received.
      </p>
      <div className="bg-gray-50 p-4 rounded-lg w-full mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Booking ID</span>
          <span className="font-medium">
            {booking?._id?.substring(0, 8) || "N/A"}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Amount Paid</span>
          <span className="font-medium">₹{trip.price}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Payment Method</span>
          <span className="font-medium capitalize">{paymentMethod}</span>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        Done
      </button>
    </div>
  );

  // Render payment error screen
  const renderPaymentError = () => (
    <div className="flex flex-col items-center py-6">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Failed</h3>
      <p className="text-gray-600 text-center mb-6">
        {error ||
          "There was an issue processing your payment. Please try again or choose another payment method."}
      </p>
      <div className="flex gap-3 w-full">
        <button
          onClick={() => setPaymentStep("select")}
          className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Change Method
        </button>
        <button
          onClick={() => setPaymentStep("processing")}
          className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Render payment processing screen
  const renderPaymentProcessing = () => (
    <div className="flex flex-col items-center py-6">
      {loading ? (
        <>
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Processing Payment
          </h3>
          <p className="text-gray-600 text-center mb-6">
            Please wait while we process your payment...
          </p>
        </>
      ) : (
        <>
          <div className="w-full mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Complete Your Payment
            </h3>

            {paymentMethod === "khalti" && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-purple-800 font-medium mb-2">
                  Khalti Payment Instructions:
                </p>
                <ol className="list-decimal list-inside text-gray-700 space-y-2">
                  <li>You'll be redirected to Khalti payment page</li>
                  <li>Login to your Khalti account</li>
                  <li>Confirm the payment of ₹{trip.price}</li>
                  <li>Wait for confirmation</li>
                </ol>
              </div>
            )}

            {paymentMethod === "esewa" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-green-800 font-medium mb-2">
                  eSewa Payment Instructions:
                </p>
                <ol className="list-decimal list-inside text-gray-700 space-y-2">
                  <li>You'll be redirected to eSewa payment page</li>
                  <li>Login to your eSewa account</li>
                  <li>Confirm the payment of ₹{trip.price}</li>
                  <li>Wait for confirmation</li>
                </ol>
              </div>
            )}

            {paymentMethod === "banking" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-medium mb-2">
                  Bank Transfer Instructions:
                </p>
                <ol className="list-decimal list-inside text-gray-700 space-y-2">
                  <li>Transfer ₹{trip.price} to our bank account</li>
                  <li>Account Number: 1234567890</li>
                  <li>Bank Name: Example Bank</li>
                  <li>Reference: TRIP-{trip._id.substring(0, 6)}</li>
                </ol>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Trip</span>
                <span className="font-medium">
                  {trip.origin} to {trip.destination}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{formatDate(trip.date)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium">₹{trip.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium capitalize">{paymentMethod}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePaymentProcess}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            disabled={loading}
          >
            {loading ? "Processing..." : "Complete Payment"}
          </button>
        </>
      )}
    </div>
  );

  // Render payment method selection
  const renderPaymentMethodSelection = () => (
    <div className="py-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        Choose Payment Method
      </h3>

      <div className="space-y-3 mb-6">
        <button
          onClick={() => setPaymentMethod("COD")}
          className={`w-full flex items-center justify-between p-3 rounded-lg border ${
            paymentMethod === "COD"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Cash on Delivery</p>
              <p className="text-sm text-gray-500">Pay when you meet</p>
            </div>
          </div>
          {paymentMethod === "COD" && (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </button>

        <button
          onClick={() => setPaymentMethod("khalti")}
          className={`w-full flex items-center justify-between p-3 rounded-lg border ${
            paymentMethod === "khalti"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Khalti</p>
              <p className="text-sm text-gray-500">Pay via Khalti wallet</p>
            </div>
          </div>
          {paymentMethod === "khalti" && (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </button>

        <button
          onClick={() => setPaymentMethod("esewa")}
          className={`w-full flex items-center justify-between p-3 rounded-lg border ${
            paymentMethod === "esewa"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">eSewa</p>
              <p className="text-sm text-gray-500">Pay via eSewa wallet</p>
            </div>
          </div>
          {paymentMethod === "esewa" && (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </button>

        <button
          onClick={() => setPaymentMethod("banking")}
          className={`w-full flex items-center justify-between p-3 rounded-lg border ${
            paymentMethod === "banking"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Bank Transfer</p>
              <p className="text-sm text-gray-500">Pay via bank transfer</p>
            </div>
          </div>
          {paymentMethod === "banking" && (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Trip</span>
          <span className="font-medium">
            {trip.origin} to {trip.destination}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Date</span>
          <span className="font-medium">{formatDate(trip.date)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Amount</span>
          <span className="font-medium">₹{trip.price}</span>
        </div>
      </div>

      <button
        onClick={handleConfirmBooking}
        className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        disabled={loading}
      >
        {loading ? "Processing..." : "Confirm Booking"}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Confirm Booking</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-4">
          {/* Trip info toggle */}
          <button
            onClick={() => setShowTripInfo(!showTripInfo)}
            className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg mb-4"
          >
            <div className="flex items-center">
              <Info className="w-5 h-5 text-gray-500 mr-2" />
              <span className="font-medium text-gray-700">Trip Details</span>
            </div>
            <ChevronRight
              className={`w-5 h-5 text-gray-500 transition-transform ${
                showTripInfo ? "rotate-90" : ""
              }`}
            />
          </button>

          {/* Trip info details */}
          {showTripInfo && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="font-medium text-gray-800">
                    {trip.origin} to {trip.destination}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium text-gray-800">
                    {formatDate(trip.date)} at{" "}
                    {new Date(trip.date).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <User className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Driver</p>
                  <p className="font-medium text-gray-800">
                    {trip.driver?.name || "Not assigned"}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Car className="w-5 h-5 text-gray-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Vehicle</p>
                  <p className="font-medium text-gray-800">
                    {trip.vehicle?.make} {trip.vehicle?.model} (
                    {trip.vehicle?.color})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payment steps */}
          {paymentStep === "select" && renderPaymentMethodSelection()}
          {paymentStep === "processing" && renderPaymentProcessing()}
          {paymentStep === "success" && renderPaymentSuccess()}
          {paymentStep === "error" && renderPaymentError()}
        </div>
      </div>
    </div>
  );
};

// Main BookingList component
const BookingList = ({ trips = [] }) => {
  // Add default empty array
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleBookNow = (trip) => {
    console.log("Book Now clicked", trip);
    setSelectedTrip(trip);
    setShowModal(true);
    console.log("showModal:", true); // Add this line
    console.log("selectedTrip:", trip); // Add this line
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTrip(null);
  };

  // Check if trips exists before mapping
  return (
    <div>
      {/* Trip list rendering logic here */}
      {trips && trips.length > 0 ? (
        trips.map((trip) => (
          <div key={trip._id} className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">
                  {trip.origin} to {trip.destination}
                </h3>
                <p>{new Date(trip.date).toLocaleDateString()}</p>
              </div>
              <button
  onClick={() => handleBookNow(trip)} // Ensure this is correct
  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-red-700 cursor-pointer"
>
  Book Now
</button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No trips available at the moment.</p>
        </div>
      )}

      {/* Booking confirmation modal */}
      {showModal && selectedTrip && (
        <BookingConfirmationModal
          trip={selectedTrip}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default BookingList;
