import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { Toaster, toast } from "sonner";
import { forgotPassword, clearError } from "../Slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());

    // Clear success message when component unmounts
    return () => setSuccessMessage("");
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");

    if (!email) {
      toast.error("Please enter your email address");
      setLoading(false);
      return;
    }

    try {
      const resultAction = await dispatch(forgotPassword({ email }));

      if (forgotPassword.fulfilled.match(resultAction)) {
        setEmail("");
        const successMsg =
          "Password reset OTP has been sent to your email. It is valid for 10 minutes.";
        setSuccessMessage(successMsg);
        toast.success(successMsg);
      } else if (forgotPassword.rejected.match(resultAction)) {
        const errorMessage =
          resultAction.payload?.message ||
          "Failed to send reset OTP. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_10px_40px_rgba(8,_112,_84,_0.12)] overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
          <div className="flex items-center justify-center">
            <div className="bg-white/10 p-3 rounded-full">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                ></path>
              </svg>
            </div>
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold text-white">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-green-100">
            Enter your email address and we'll send you an OTP to reset your
            password.
          </p>
        </div>

        <div className="p-6 md:p-8">
          <Toaster position="top-right" />

          {successMessage && (
            <div
              className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg relative"
              role="alert"
            >
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          <div className="w-full relative">
            {(loading || isLoading) && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-xl z-10">
                <div className="h-10 w-10 border-4 border-t-transparent border-green-500 rounded-full animate-spin"></div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-10 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  placeholder="Email address"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || isLoading}
              >
                {loading || isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Reset OTP"
                )}
              </button>

              <div className="text-sm text-center">
                <Link
                  to="/login"
                  className="text-green-600 hover:text-green-700 font-medium transition-colors inline-flex items-center gap-1 hover:gap-2 duration-200"
                >
                  <svg
                    className="w-4 h-4 transform rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                  Back to login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
