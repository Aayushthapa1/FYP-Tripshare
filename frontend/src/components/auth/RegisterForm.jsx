import React, { useState } from "react";
import { User, Mail, Home, Lock, UserCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Toaster,toast } from "sonner";
import { registerUser } from "../../authSetup";

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Local form state
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    address: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle each input's change event
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Basic form validation
  const validateForm = (data) => {
    const { fullName, userName, address, email, password } = data;
    let isValid = true;
    const errors = [];

    const isEmpty = (field) => !field || field.trim().length === 0;

    // Check if ALL fields are empty
    if (Object.values(data).every(isEmpty)) {
      errors.push("Please fill out the form.");
    }
    if (!fullName || fullName.trim().length < 3) {
      errors.push("Full Name must be at least 3 characters long.");
    }
    if (!userName || userName.trim().length < 3) {
      errors.push("Username must be at least 3 characters long.");
    }
    if (isEmpty(address)) {
      errors.push("Address is required.");
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailPattern.test(email)) {
      errors.push("Please enter a valid email address.");
    }
    if (!password || password.length < 6) {
      errors.push("Password must be at least 6 characters long.");
    }

    if (errors.length > 0) {
      errors.forEach((err) =>  toast.error(err));
      isValid = false;
    }

    return isValid;
  };

  // Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm(formData);
    if (!isValid) return;

    setLoading(true);
    console.log("Submitting form data...", formData);

    try {
      const response = await dispatch(registerUser(formData)).unwrap();
      console.log("The response in the register form:", response);

      // Check the success criteria from your API response
      if (response?.StatusCode === 200 && response?.IsSuccess === true) {;
        toast.success("Registration successful!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        console.log("Registration failed. Error response:", response);
        toast.error(
          response?.ErrorMessage?.[0]?.message ||
            "Server Error. Please try again."
        );
      }
    } catch (error) {
      console.error("Error during registration:", error);

      // If error came from the API
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "An error occurred.");
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="w-full max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg">
      <Toaster position="top-right" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-xl">
          <div className="loader ease-linear border-4 border-t-4 border-green-500 h-10 w-10 rounded-full animate-spin"></div>
        </div>
      )}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
            <User size={20} />
          </div>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
            placeholder="Full Name"
            required
          />
        </div>

        {/* Username */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
            <UserCircle size={20} />
          </div>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            className="w-full px-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
            placeholder="Username"
            required
          />
        </div>

        {/* Address */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
            <Home size={20} />
          </div>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
            placeholder="Address"
            required
          />
        </div>

        {/* Email */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
            <Mail size={20} />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
            placeholder="Email"
            required
          />
        </div>

        {/* Password */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
            <Lock size={20} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
            placeholder="Password"
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 focus:outline-none"
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

        <button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              <span>Creating account...</span>
            </div>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
