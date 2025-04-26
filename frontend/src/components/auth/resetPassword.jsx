import { useState, useEffect } from "react";
import { KeyRound, Lock, Eye, EyeOff } from "lucide-react";
import { Toaster, toast } from "sonner";
import {
  resetPassword,
  clearError,
  clearPasswordResetStatus,
} from "../Slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams(); // Get token from URL if you're using route like /reset-password/:token

  const [formData, setFormData] = useState({
    token: token || "", // Use token from URL params if available
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
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
      setFormData({ token: "", newPassword: "", confirmPassword: "" });

      // Redirect to login page after 3 seconds
      toast.info("Redirecting to login page.Password reset successful!");
      setTimeout(() => {
        navigate("/login");
      }, 150000);
    } else if (passwordResetStatus === "failed" && error) {
      toast.error(error);
    }
  }, [passwordResetStatus, passwordResetMessage, error, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear password error when user types in password fields
    if (name === "newPassword" || name === "confirmPassword") {
      setPasswordError("");
    }

    // Check password strength if newPassword field is being updated
    if (name === "newPassword") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    // Password strength criteria
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    // Calculate score (0-4)
    let score = 0;
    if (hasLowerCase) score++;
    if (hasUpperCase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;
    if (isLongEnough) score++;

    // Set message and color based on score
    let message = "";
    let color = "";

    if (password.length === 0) {
      message = "";
      color = "";
    } else if (score < 2) {
      message = "Weak password";
      color = "red";
    } else if (score < 4) {
      message = "Moderate password";
      color = "orange";
    } else {
      message = "Strong password";
      color = "green";
    }

    setPasswordStrength({ score, message, color });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    // Validate password strength
    if (passwordStrength.score < 3) {
      setPasswordError("Please create a stronger password");
      toast.error("Please create a stronger password");
      return;
    }

    dispatch(resetPassword(formData));
  };

  // Get background color for password strength meter
  const getStrengthColor = () => {
    switch (passwordStrength.color) {
      case "red":
        return "bg-red-500";
      case "orange":
        return "bg-orange-500";
      case "green":
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
            </div>
          </div>
          <h2 className="mt-4 text-center text-2xl font-bold text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-green-100">
            Create a new secure password for your account
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
                  <p className="font-medium">Password Reset Successful!</p>
                  <p className="text-sm">Redirecting to login page...</p>
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

            <form className="space-y-5" onSubmit={handleSubmit}>
              {!token && (
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
                    <KeyRound size={18} />
                  </div>
                  <input
                    id="token"
                    name="token"
                    type="text"
                    value={formData.token}
                    onChange={handleChange}
                    className="w-full px-10 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                    placeholder="Enter reset token from email"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
                  <Lock size={18} />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-10 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  placeholder="Enter new password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex="-1"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password strength meter */}
              {formData.newPassword && (
                <div className="space-y-1">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor()}`}
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p
                    className={`text-xs font-medium text-${passwordStrength.color}-600`}
                  >
                    {passwordStrength.message}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Password must contain:</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      <li
                        className={
                          formData.newPassword.length >= 8
                            ? "text-green-600"
                            : ""
                        }
                      >
                        At least 8 characters
                      </li>
                      <li
                        className={
                          /[A-Z]/.test(formData.newPassword)
                            ? "text-green-600"
                            : ""
                        }
                      >
                        One uppercase letter
                      </li>
                      <li
                        className={
                          /[a-z]/.test(formData.newPassword)
                            ? "text-green-600"
                            : ""
                        }
                      >
                        One lowercase letter
                      </li>
                      <li
                        className={
                          /\d/.test(formData.newPassword)
                            ? "text-green-600"
                            : ""
                        }
                      >
                        One number
                      </li>
                      <li
                        className={
                          /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword)
                            ? "text-green-600"
                            : ""
                        }
                      >
                        One special character
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
                  <Lock size={18} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-10 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  placeholder="Confirm new password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex="-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {passwordError && (
                <p className="text-sm text-red-600 mt-1">{passwordError}</p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      <span>Resetting...</span>
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>

              <div className="text-sm text-center pt-2">
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

export default ResetPassword;
