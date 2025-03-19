
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  extractKhaltiCallbackParams,
  getPaymentDetails,
  clearPaymentState
} from "../Slices/paymentSlice";
import { toast } from "sonner";

const PaymentCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, currentPayment } = useSelector(
    (state) => state.payment
  );

  useEffect(() => {
    // Clear any previous payment state
    dispatch(clearPaymentState());
    
    // Extract parameters from URL
    const params = extractKhaltiCallbackParams();

    if (params.pidx && params.purchase_order_id) {
      // Get the payment details
      dispatch(getPaymentDetails(params.purchase_order_id))
        .unwrap()
        .then((data) => {
          if (data.payment.status === "completed") {
            toast.success("Payment successful!");
            navigate("/payment-success");
          } else if (data.payment.status === "failed") {
            toast.error("Payment failed. Please try again.");
            navigate("/payment-failed");
          } else {
            toast.info("Payment is being processed.");
            navigate("/bookings");
          }
        })
        .catch((err) => {
          toast.error(err.message || "Failed to verify payment");
          navigate("/bookings");
        });
    } else {
      toast.error("Invalid payment callback");
      navigate("/bookings");
    }
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          Verifying Payment
        </h1>

        {loading ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">
              Please wait while we verify your payment...
            </p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/bookings")}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Bookings
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-600">Redirecting...</p>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
