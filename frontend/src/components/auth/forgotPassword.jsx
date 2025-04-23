import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { Toaster, toast } from "sonner";
import {
  forgotPassword,
  clearError,
  clearPasswordResetStatus,
} from "../Slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const { isLoading, error, passwordResetStatus, passwordResetMessage } =
    useSelector((state) => state.auth);

  useEffect(() => {
    // Clear any previous errors and reset status when component mounts
    dispatch(clearError());
    dispatch(clearPasswordResetStatus());

    return () => {
      // Clean up on unmount
      dispatch(clearPasswordResetStatus());
    };
  }, [dispatch]);

  // Handle status changes from Redux
  useEffect(() => {
    if (passwordResetStatus === "success" && passwordResetMessage) {
      toast.success(passwordResetMessage);
      setEmail("");
    } else if (passwordResetStatus === "failed" && error) {
      toast.error(error);
    }
  }, [passwordResetStatus, passwordResetMessage, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    dispatch(forgotPassword({ email }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_10px_40px_rgba(8,_112,_84,_0.12)] overflow-hidden transition-all duration-300 hover:shadow-[0_15px_50px_rgba(8,_112,_84,_0.18)]">
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
            Enter your email address and we'll send you a password reset link.
          </p>
        </div>

        <div className="p-6 md:p-8">
          <Toaster position="top-right" richColors closeButton />

          {passwordResetStatus === "success" && (
            <div
              className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg relative"
              role="alert"
            >
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Password Reset Link Sent!</p>
                  <p className="text-sm">{passwordResetMessage}</p>
                </div>
              </div>
            </div>
          )}

          <div className="w-full relative">
            {isLoading && (
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
                  className="w-full px-10 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  placeholder="Email address"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Reset Link"
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
