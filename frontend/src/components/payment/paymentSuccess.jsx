import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Check,
  Home,
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Clock,
  CreditCard,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { toast, Toaster } from "sonner";
import { getPaymentDetails, getUserPayments } from "../Slices/paymentSlice";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  // Get auth user and payment details from Redux store
  const { user } = useSelector((state) => state.auth);
  const {
    currentPayment,
    loading: paymentLoading,
    error: paymentError,
  } = useSelector((state) => state.payment);

  // Get transaction details directly from URL parameters
  const pidx = searchParams.get("pidx");
  const transactionId = searchParams.get("transaction_id");
  const amountInPaisa = searchParams.get("amount");
  const purchaseOrderId = searchParams.get("purchase_order_id");
  const paymentId = searchParams.get("payment_id");

  // Convert paisa to NPR (1 NPR = 100 paisa)
  const amountInNPR = amountInPaisa ? parseInt(amountInPaisa) / 100 : null;

  // Check for transaction details from navigation state
  const transactionDetailsFromState = location.state?.transactionDetails;
  console.log("transaction details from state", transactionDetailsFromState);

  useEffect(() => {
    // First check if we have transaction details in navigation state
    if (transactionDetailsFromState) {
      console.log(
        "Using transaction details from navigation state:",
        transactionDetailsFromState
      );

      // Store in localStorage as backup
      if (transactionDetailsFromState.payment) {
        localStorage.setItem(
          "lastPayment",
          JSON.stringify(transactionDetailsFromState.payment)
        );
      } else {
        localStorage.setItem(
          "lastPayment",
          JSON.stringify(transactionDetailsFromState)
        );
      }

      toast.success("Payment completed successfully!");
      setLoading(false);
      return; // Skip the API call if we have transaction details from state
    }

    console.log("URL Payment parameters:", {
      pidx,
      transactionId,
      purchaseOrderId,
      paymentId,
      amount: amountInPaisa,
      amountInNPR,
    });

    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);

        // Use the first available identifier to fetch payment details
        const paymentIdentifier =
          paymentId || purchaseOrderId || pidx || transactionId;
        console.log("Payment identifier:", paymentIdentifier);

        if (paymentIdentifier) {
          console.log(
            `Fetching payment details with identifier: ${paymentIdentifier}`
          );

          // Dispatch the Redux action to get payment details
          const resultAction = await dispatch(
            getPaymentDetails(paymentIdentifier)
          );
          console.log("Result action:", resultAction);

          if (getPaymentDetails.fulfilled.match(resultAction)) {
            console.log(
              "Successfully retrieved payment details:",
              resultAction.payload
            );
            toast.success("Payment completed successfully!");

            // Store in localStorage as backup - include the full payload
            localStorage.setItem(
              "lastPayment",
              JSON.stringify(resultAction.payload.payment)
            );
          } else {
            console.warn(
              "Failed to retrieve payment details:",
              resultAction.error
            );
            toast.warning(
              "Payment was successful, but details could not be retrieved"
            );
            checkLocalStorage();
          }
        } else {
          console.log("No payment identifiers found in URL");
          checkLocalStorage();
        }
      } catch (error) {
        console.error("Error in payment success flow:", error);
        toast.error("There was an issue retrieving your payment information");
        checkLocalStorage();
      } finally {
        setLoading(false);
      }
    };

    const checkLocalStorage = () => {
      // Check localStorage if Redux fetch fails or no identifiers
      const storedPayment = localStorage.getItem("lastPayment");
      if (storedPayment) {
        console.log("Using stored payment details from localStorage");
      }
    };

    fetchPaymentDetails();

    // Cleanup stored payment data after 5 minutes
    const timer = setTimeout(() => {
      localStorage.removeItem("lastPayment");
    }, 5 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [
    dispatch,
    location,
    transactionDetailsFromState,
    pidx,
    transactionId,
    amountInPaisa,
    purchaseOrderId,
    paymentId,
  ]);

  // Prioritize payment details in this order:
  // 1. Transaction details from navigation state
  // 2. Current payment from Redux store
  // 3. Stored payment from localStorage
  // 4. URL parameters for direct display
  const paymentDetailsFromState =
    transactionDetailsFromState?.payment || transactionDetailsFromState;

  const paymentDetails =
    paymentDetailsFromState ||
    currentPayment ||
    JSON.parse(localStorage.getItem("lastPayment") || "null");

  console.log("Current payment details:", paymentDetails);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString || "N/A";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get formatted amount either from payment details or direct URL parameters
  const getFormattedAmount = () => {
    // First try to get amount from payment details
    if (displayData?.amount) {
      return formatCurrency(displayData.amount);
    }
    // If not available, use the direct URL param
    if (amountInNPR) {
      return formatCurrency(amountInNPR);
    }
    return "N/A";
  };

  // Handle chat with driver
  const handleChatWithDriver = () => {
    // Navigate to chat page with driver and trip information
    navigate(`/chats`);
  };

  // Show loading state when either component is loading or Redux is loading
  if (loading || paymentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading payment details...
          </p>
        </div>
      </div>
    );
  }

  // Show error state if there's a payment error
  if (paymentError && !paymentDetails && !pidx && !transactionId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Error Retrieving Payment Details
            </h1>
            <p className="text-gray-600 mb-6">
              Your payment might have been successful, but we couldn't retrieve
              the details. Please check your bookings or contact support if you
              have any questions.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/bookings/")}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View My Bookings
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Fallback data if we still don't have payment details
  const fallbackData = {
    status: "completed",
    amount: amountInNPR || 0,
    transactionId:
      transactionId || purchaseOrderId || pidx || "Available in your account",
    createdAt: new Date().toISOString(),
    booking: {
      trip: {
        departureLocation: "Your departure",
        destinationLocation: "Your destination",
        departureDate: new Date().toISOString(),
        departureTime: "Scheduled time",
      },
      seatsBooked: 1,
    },
    user: {
      fullName: user?.fullName || "User",
      email: user?.email || "user@example.com",
    },
  };

  // Use either the actual payment details or fallback data
  const displayData = paymentDetails || fallbackData;

  // Get driver/recipient information
  const driverInfo = displayData?.booking?.trip?.driver || {
    fullName: "Trip Provider",
  };

  console.log("Display data:", displayData);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Success Header */}
          <div className="bg-green-600 p-6 text-white">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center mt-4">
              Payment Successful!
            </h1>
            <p className="text-center text-green-100 mt-1">
              Your trip has been booked successfully.
            </p>
          </div>

          {/* Payment Details */}
          <div className="p-6">
            <div className="border border-gray-200 rounded-lg p-5 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Payment Details
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Amount Paid</p>
                  <p className="font-medium text-gray-900">
                    {getFormattedAmount()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <div className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <p className="font-medium text-gray-900 capitalize">
                      {displayData?.status || "Completed"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(displayData?.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium text-gray-900">
                    {displayData?.transactionId ||
                      transactionId ||
                      displayData?._id ||
                      pidx ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-900">
                    {displayData?.paymentMethod || "Khalti"}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Parties */}
            <div className="border border-gray-200 rounded-lg p-5 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Payment Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <CreditCard className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Paid By</p>
                    <p className="font-medium text-gray-900">
                      {displayData.user?.fullName || user?.fullName || "You"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {displayData.user?.email || user?.email || ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Paid To</p>
                    <p className="font-medium text-gray-900">
                      {driverInfo.fullName || "Trip Provider"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {driverInfo.email || ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trip Details Section */}
            {displayData?.booking?.trip && (
              <div className="border border-gray-200 rounded-lg p-5 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Trip Details
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Route</p>
                      <p className="font-medium text-gray-900">
                        {displayData.booking.trip.startLocation ||
                          displayData.booking.trip.departureLocation ||
                          "N/A"}{" "}
                        →{" "}
                        {displayData.booking.trip.endLocation ||
                          displayData.booking.trip.destinationLocation ||
                          "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(displayData.booking.trip.departureDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium text-gray-900">
                        {formatTime(displayData.booking.trip.departureTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <User className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Seats Booked</p>
                      <p className="font-medium text-gray-900">
                        {displayData.booking.seatsBooked || 1}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
              <h3 className="text-md font-medium text-blue-800 mb-2">
                What's Next?
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                A confirmation email has been sent to{" "}
                {user?.email ||
                  displayData?.user?.email ||
                  "your email address"}
                . You can also view your booking details in your account.
              </p>
              <p className="text-sm text-blue-700">
                For any assistance or questions regarding your booking, please
                contact our support team.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <button
                onClick={() => navigate("/bookings")}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <User className="w-4 h-4 mr-2" /> View My Bookings
              </button>
              <button
                onClick={handleChatWithDriver}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <MessageSquare className="w-4 h-4 mr-2" /> Chat with Driver
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
              >
                <Home className="w-4 h-4 mr-2" /> Return Home
              </button>
              <button
                onClick={() => navigate("/trips")}
                className="px-6 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Browse More Trips
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
