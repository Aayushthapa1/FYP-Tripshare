import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Check, Home, ArrowLeft, Calendar, MapPin, User, Clock } from "lucide-react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import axios from "axios";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Try to get payment ID from query params
    const queryParams = new URLSearchParams(location.search);
    const pidx = queryParams.get("pidx");
    const transactionId = queryParams.get("transaction_id");
    const purchaseOrderId = queryParams.get("purchase_order_id");

    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        let response;
        
        // If we have a purchase_order_id, fetch the payment details
        if (purchaseOrderId) {
          response = await axios.get(`/api/payments/${purchaseOrderId}`);
          setPaymentDetails(response.data.data.payment);
        } else {
          // If no payment ID in URL, check if there's payment info in localStorage
          const storedPayment = localStorage.getItem('lastPayment');
          if (storedPayment) {
            setPaymentDetails(JSON.parse(storedPayment));
          } else {
            // Fallback to showing generic success without details
            setPaymentDetails({
              status: "completed",
              amount: "Unknown",
              transactionId: transactionId || "Not available",
              createdAt: new Date().toISOString(),
              booking: {
                trip: {
                  departureLocation: "Your destination",
                  destinationLocation: "Your destination",
                  departureDate: new Date().toISOString(),
                  departureTime: "Scheduled time",
                }
              }
            });
          }
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();

    // Cleanup stored payment data after 5 minutes
    const timer = setTimeout(() => {
      localStorage.removeItem('lastPayment');
    }, 5 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [location]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="text-2xl font-bold text-center mt-4">Payment Successful!</h1>
            <p className="text-center text-green-100 mt-1">
              Your trip has been booked successfully.
            </p>
          </div>

          {/* Payment Details */}
          <div className="p-6">
            <div className="border border-gray-200 rounded-lg p-5 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Amount Paid</p>
                  <p className="font-medium text-gray-900">₹{paymentDetails?.amount || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <div className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <p className="font-medium text-gray-900 capitalize">{paymentDetails?.status || "Completed"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Date</p>
                  <p className="font-medium text-gray-900">{formatDate(paymentDetails?.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium text-gray-900">{paymentDetails?.transactionId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-900">Khalti</p>
                </div>
              </div>
            </div>

            {/* Trip Details Section */}
            {paymentDetails?.booking?.trip && (
              <div className="border border-gray-200 rounded-lg p-5 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Trip Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Route</p>
                      <p className="font-medium text-gray-900">
                        {paymentDetails.booking.trip.departureLocation} → {paymentDetails.booking.trip.destinationLocation}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(paymentDetails.booking.trip.departureDate)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium text-gray-900">
                        {formatTime(paymentDetails.booking.trip.departureTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <User className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Seats Booked</p>
                      <p className="font-medium text-gray-900">
                        {paymentDetails.booking.seatsBooked || 1}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
              <h3 className="text-md font-medium text-blue-800 mb-2">What's Next?</h3>
              <p className="text-sm text-blue-700 mb-3">
                A confirmation email has been sent to {user?.email || "your email address"}. 
                You can also view your booking details in your account.
              </p>
              <p className="text-sm text-blue-700">
                For any assistance or questions regarding your booking, please contact our support team.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <button
                onClick={() => navigate("/my-bookings")}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <User className="w-4 h-4 mr-2" /> View My Bookings
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