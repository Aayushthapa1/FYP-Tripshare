import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Home, ArrowLeft, RefreshCw } from "lucide-react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get error reason from URL query params if available
  const queryParams = new URLSearchParams(location.search);
  const errorReason = queryParams.get("error");
  
  let errorMessage = "Your payment could not be processed.";
  
  // Set custom error message based on error reason
  if (errorReason === "trip_not_found") {
    errorMessage = "The trip you were trying to book is no longer available.";
  } else if (errorReason === "seats_unavailable") {
    errorMessage = "The seats you were trying to book are no longer available.";
  } else if (errorReason === "server_error") {
    errorMessage = "We encountered a server error while processing your payment.";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Failed Header */}
          <div className="bg-red-600 p-6 text-white">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <X className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center mt-4">Payment Failed</h1>
            <p className="text-center text-red-100 mt-1">
              We couldn't complete your payment.
            </p>
          </div>

          {/* Error Details */}
          <div className="p-6">
            <div className="bg-red-50 border border-red-100 rounded-lg p-5 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">What Happened?</h2>
              <p className="text-gray-700">
                {errorMessage}
              </p>
            </div>

            {/* Troubleshooting Tips */}
            <div className="border border-gray-200 rounded-lg p-5 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Troubleshooting Tips</h2>
              
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-xs font-medium">1</span>
                  </div>
                  <p className="text-gray-700">Check your internet connection and try again.</p>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-xs font-medium">2</span>
                  </div>
                  <p className="text-gray-700">Ensure your Khalti account has sufficient funds.</p>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-xs font-medium">3</span>
                  </div>
                  <p className="text-gray-700">Verify that your payment information is correct.</p>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-xs font-medium">4</span>
                  </div>
                  <p className="text-gray-700">If the problem persists, please contact our support team.</p>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
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
                <ArrowLeft className="w-4 h-4 mr-2" /> Browse Trips
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentFailed;