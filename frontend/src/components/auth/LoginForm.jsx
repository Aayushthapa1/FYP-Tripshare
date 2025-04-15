import { useState, useEffect } from "react";
import { Mail, Lock } from "lucide-react";
import { Toaster, toast } from "sonner";
import { loginUser } from "../Slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import socketService from "../socket/socketService"; 

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { email, password } = credentials;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { isAuthenticated, isLoading, user } = useSelector((state) => state?.auth);

  // Effect to connect socket on authentication change
  useEffect(() => {
    // If the user is authenticated and we have a user object, connect to socket
    if (isAuthenticated && user?._id) {
      console.log("User authenticated, connecting to socket service");
      
      // Connect to socket server if not already connected
      if (!socketService.connected) {
        socketService.connect();
      }
      
      // Send user info to socket server
      socketService.sendUserInfo(user._id, user.role);
      
      // Redirect based on role after small delay to ensure connections are established
      setTimeout(() => {
        if (user.role === 'driver') {
          navigate('/driverridestatus');
        } else {
          navigate('/userDashboard');
        }
      }, 500);
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error("Please enter your email and password to login");
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting login with credentials:", {
        email,
        password: "***",
      });
      const resultAction = await dispatch(loginUser(credentials));

      console.log("Login result action:", resultAction);

      // Check if the action was fulfilled or rejected
      if (loginUser.fulfilled.match(resultAction)) {
        // Success case
        const response = resultAction.payload;
        console.log("Login success response:", response);
        toast.success("Login successful!");
        
        // We don't navigate here since it's handled in the useEffect above
        // This ensures socket connection happens before navigation
      } else if (loginUser.rejected.match(resultAction)) {
        // Error case - handle the rejection
        console.log(
          "Login rejected:",
          resultAction.payload,
          resultAction.error
        );
        const error = resultAction.payload;

        // Display formatted error message
        const errorMessage =
          error?.ErrorMessage?.[0]?.message ||
          error?.message ||
          "Login failed. Please check your credentials and try again.";

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Login unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative">
      <Toaster position="top-right" />
      {(loading || isLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-xl z-10">
          <div className="h-10 w-10 border-4 border-t-transparent border-green-500 rounded-full animate-spin"></div>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Email Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
            <Mail size={18} />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            className="w-full px-10 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
            placeholder="Email"
            required
          />
        </div>

        {/* Password Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600">
            <Lock size={18} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            className="w-full px-10 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800 placeholder-gray-400"
            placeholder="Password"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clipRule="evenodd"
                />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            )}
          </button>
        </div>

        {/* Forgot Password */}
        <div className="flex items-center justify-end text-sm">
          <a
            href="/forgot-password"
            className="text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || isLoading}
        >
          {loading || isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            "Sign in"
          )}
        </button>

        <div className="text-xs text-center text-gray-500 mt-4">
          By signing in, you agree to our
          <a href="#" className="text-green-600 hover:underline mx-1">
            Terms of Service
          </a>
          and
          <a href="#" className="text-green-600 hover:underline mx-1">
            Privacy Policy
          </a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;