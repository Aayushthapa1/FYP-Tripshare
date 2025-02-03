import React, { useState } from "react";
import { User, Mail, Home, Lock, UserCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
      errors.forEach((err) => toast.error(err));
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
      if (response?.StatusCode === 200 && response?.IsSuccess === true) {
        navigate("/login");
        toast.success("Registration successful!");
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
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
            <User size={20} />
          </div>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-10 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-transparent peer"
            placeholder="Full Name"
            required
          />
          <label
            htmlFor="fullName"
            className="absolute left-10 top-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500
                       peer-placeholder-shown:translate-y-0 
                       peer-placeholder-shown:top-1/2 
                       peer-placeholder-shown:text-base 
                       peer-focus:top-2 
                       peer-focus:text-sm 
                       peer-focus:text-indigo-600 
                       transition-all duration-200"
          >
            Full Name
          </label>
        </div>

        {/* Username */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
            <UserCircle size={20} />
          </div>
          <input
            type="text"
            id="userName"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            className="w-full px-10 py-3 bg-gray-50 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       transition-all duration-200 text-gray-800 placeholder-transparent peer"
            placeholder="Username"
            required
          />
          <label
            htmlFor="userName"
            className="absolute left-10 top-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500
                       peer-placeholder-shown:translate-y-0
                       peer-placeholder-shown:top-1/2
                       peer-placeholder-shown:text-base
                       peer-focus:top-2 
                       peer-focus:text-sm 
                       peer-focus:text-indigo-600 
                       transition-all duration-200"
          >
            Username
          </label>
        </div>

        {/* Address */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
            <Home size={20} />
          </div>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-10 py-3 bg-gray-50 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       transition-all duration-200 text-gray-800 placeholder-transparent peer"
            placeholder="Address"
            required
          />
          <label
            htmlFor="address"
            className="absolute left-10 top-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500
                       peer-placeholder-shown:translate-y-0 
                       peer-placeholder-shown:top-1/2
                       peer-placeholder-shown:text-base
                       peer-focus:top-2 
                       peer-focus:text-sm 
                       peer-focus:text-indigo-600 
                       transition-all duration-200"
          >
            Address
          </label>
        </div>

        {/* Email */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
            <Mail size={20} />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-10 py-3 bg-gray-50 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       transition-all duration-200 text-gray-800 placeholder-transparent peer"
            placeholder="Email"
            required
          />
          <label
            htmlFor="email"
            className="absolute left-10 top-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500
                       peer-placeholder-shown:translate-y-0 
                       peer-placeholder-shown:top-1/2 
                       peer-placeholder-shown:text-base 
                       peer-focus:top-2
                       peer-focus:text-sm
                       peer-focus:text-indigo-600 
                       transition-all duration-200"
          >
            Email
          </label>
        </div>

        {/* Password */}
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
            <Lock size={20} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-10 py-3 bg-gray-50 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       transition-all duration-200 text-gray-800 placeholder-transparent peer"
            placeholder="Password"
            required
          />
          <label
            htmlFor="password"
            className="absolute left-10 top-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500
                       peer-placeholder-shown:translate-y-0
                       peer-placeholder-shown:top-1/2
                       peer-placeholder-shown:text-base
                       peer-focus:top-2 
                       peer-focus:text-sm
                       peer-focus:text-indigo-600
                       transition-all duration-200"
          >
            Password
          </label>
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 focus:outline-none"
          >
            {showPassword ? <Lock size={20} /> : <Lock size={20} />}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-6 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700
                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform
                     transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
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
