import React, { useEffect, useState } from "react";
import { Mail, Lock } from "lucide-react";
import { Toaster,toast } from 'sonner';
import { loginUser } from "../../authSetup";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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
 
    const { isAuthenticated } = useSelector((state) => state?.auth);
  
    useEffect(() => {
      if (!isAuthenticated) {
        navigate("/login"); // Redirect to login if not authenticated
      }
    }, [isAuthenticated, navigate]);

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
    }

    try {
      const response = await dispatch(loginUser(credentials));

      console.log("The response in the login form is", response);

      if (response.payload.status === 200) {
        toast.success("Login successful!");
        navigate("/driverregistration"); // Redirect to profile setup after login
      } else {
        const errorMessage =
          response.payload.details?.ErrorMessage?.[0]?.message ||
          "Server Error. Please try again.";
          toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        toast.error(
          error.response.data?.ErrorMessage?.[0]?.message ||
            "An unexpected error occurred."
        );
      } else {
        toast.error("Network error, please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
    <Toaster position="top-right" />
    {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-xl">
          <div className="loader ease-linear border-4 border-t-4 border-green-500 h-10 w-10 rounded-full animate-spin"></div>
        </div>
      )}
      <form
        className="space-y-6"
        onChange={handleChange}
        onSubmit={handleSubmit}
      >
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -mt-2.5 text-gray-400 group-focus-within:text-green-600 transition-colors">
            <Mail size={20} />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            className="w-full px-10 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
            placeholder="Email"
            required
          />
        </div>

        {/* Password Input */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -mt-2.5 text-gray-400 group-focus-within:text-green-600 transition-colors">
            <Lock size={20} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={credentials.password}
            className="w-full px-10 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
            placeholder="Password"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -mt-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
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

        {/* Remember Me and Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <a
            href="/forgot-password"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
