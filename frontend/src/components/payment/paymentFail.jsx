import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  AlertTriangle,
  Home,
  ArrowLeft,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { toast, Toaster } from "sonner";

const PaymentError = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Get error details from query params
  const queryParams = new URLSearchParams(location.search);
  const errorCode = queryParams.get("code");
  const errorMessage =
    queryParams.get("message") || "Your payment could not be processed";
  const paymentId = queryParams.get("payment_id");
  const transactionId = queryParams.get("transaction_id");

  useEffect(() => {
    // Show error toast when component mounts
    toast.error("Payment failed", {
      description: errorMessage || "There was an issue processing your payment",
    });
  }, [errorMessage]);

  // Determine error type and message
  const getErrorDetails = () => {
    switch (errorCode) {
      case "insufficient_funds":
        return {
          title: "Insufficient Funds",
          message:
            "Your payment method doesn't have sufficient funds to complete this transaction.",
          suggestion:
            "Please try a different payment method or add funds to your account.",
        };
      case "payment_declined":
        return {
          title: "Payment Declined",
          message: "Your payment was declined by the payment provider.",
          suggestion:
            "Please check your payment details or try a different payment method.",
        };
      case "transaction_failed":
        return {
          title: "Transaction Failed",
          message:
            "The transaction could not be completed due to a technical issue.",
          suggestion:
            "Please try again later or contact our support team for assistance.",
        };
      case "session_expired":
        return {
          title: "Session Expired",
          message: "Your payment session has expired.",
          suggestion: "Please try booking your trip again.",
        };
      default:
        return {
          title: "Payment Error",
          message:
            errorMessage || "There was an issue processing your payment.",
          suggestion:
            "Please try again or contact our support team for assistance.",
        };
    }
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Error Header */}
          <div className="bg-red-600 p-6 text-white">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center mt-4">
              {errorDetails.title}
            </h1>
            <p className="text-center text-red-100 mt-1">
              {errorDetails.message}
            </p>
          </div>

          {/* Error Details */}
          <div className="p-6">
            {/* Transaction Information */}
            {(paymentId || transactionId) && (
              <div className="border border-gray-200 rounded-lg p-5 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Transaction Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {paymentId && (
                    <div>
                      <p className="text-sm text-gray-500">Payment ID</p>
                      <p className="font-medium text-gray-900">{paymentId}</p>
                    </div>
                  )}
                  {transactionId && (
                    <div>
                      <p className="text-sm text-gray-500">Transaction ID</p>
                      <p className="font-medium text-gray-900">
                        {transactionId}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      <p className="font-medium text-gray-900">Failed</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* What to do next */}
            <div className="bg-red-50 rounded-lg p-5 border border-red-100 mb-6">
              <h3 className="text-md font-medium text-red-800 mb-2">
                What Went Wrong?
              </h3>
              <p className="text-sm text-red-700 mb-3">
                {errorDetails.suggestion}
              </p>
              <p className="text-sm text-red-700">
                If you continue to experience issues, please contact our support
                team with the
                {paymentId ? " Payment ID" : ""}
                {paymentId && transactionId ? " and" : ""}
                {transactionId ? " Transaction ID" : ""}
                {paymentId || transactionId ? " shown above." : "."}
              </p>
            </div>

            {/* Suggestions */}
            <div className="border border-gray-200 rounded-lg p-5 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Suggestions
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 mr-2"></span>
                  Check that your payment details are correct
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 mr-2"></span>
                  Ensure you have sufficient funds in your account
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 mr-2"></span>
                  Try a different payment method
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 mr-2"></span>
                  If the problem persists, contact your bank or our support team
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
                onClick={() => navigate("/support")}
                className="px-6 py-2.5 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <HelpCircle className="w-4 h-4 mr-2" /> Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentError;
