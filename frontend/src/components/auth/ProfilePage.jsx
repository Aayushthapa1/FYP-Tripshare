import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  FileText,
  BookOpen,
  Calendar,
  Shield,
  Clock,
  CheckCircle2,
  UserCheck,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUserProfile,
  updateUserProfileAction,
} from "../Slices/userSlice.js";
import { logoutUser } from "../Slices/authSlice.js";

const ProfileModal = ({ isOpen, onClose, userId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);
  const userData = useSelector(
    (state) => state.user?.userData?.Result?.user_data
  );

  // State for edit mode and form data
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    bio: "",
    notes: "",
  });

  // State for form validation
  const [formErrors, setFormErrors] = useState({});

  // State to handle save success notification
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Load bio and notes from localStorage when component mounts
  useEffect(() => {
    if (userId) {
      const savedBio = localStorage.getItem(`user_${userId}_bio`);
      const savedNotes = localStorage.getItem(`user_${userId}_notes`);

      if (savedBio || savedNotes) {
        setFormData((prev) => ({
          ...prev,
          bio: savedBio || "",
          notes: savedNotes || "",
        }));
      }
    }
  }, [userId]);

  // Pre-fill form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData((prev) => ({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        address: userData.address || "",
        // Keep existing bio and notes from localStorage if they exist
        bio: prev.bio || "",
        notes: prev.notes || "",
      }));
    }
  }, [userData]);

  // Fetch user profile when userId changes or modal opens
  useEffect(() => {
    if (userId && isOpen) {
      dispatch(getUserProfile(userId));
    }
  }, [dispatch, userId, isOpen]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const confirmLogout = () => {
    toast.custom(
      (t) => (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Confirm Logout
          </h3>
          <p className="text-gray-600 mb-4">Are you sure you want to logout?</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleLogout();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: "top-center",
      }
    );
  };

  // Actual logout handler
  const handleLogout = () => {
    try {
      // Clear token from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");

      // Clear cookies
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
      });

      // Dispatch Redux logout action
      dispatch(logoutUser());

      // Show success toast
      toast.success("Successfully logged out");

      // Close the modal
      onClose();

      // Redirect user to home page
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/[^0-9]/g, ""))) {
      errors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Save bio and notes to localStorage
    if (userId) {
      localStorage.setItem(`user_${userId}_bio`, formData.bio);
      localStorage.setItem(`user_${userId}_notes`, formData.notes);

      // Remove bio and notes from the data sent to backend
      const backendData = { ...formData };
      delete backendData.bio;
      delete backendData.notes;

      // Only update profile data that the backend supports
      dispatch(updateUserProfileAction({ userId, userData: backendData }))
        .unwrap()
        .then(() => {
          // Show success message
          setShowSaveSuccess(true);
          setTimeout(() => setShowSaveSuccess(false), 3000);

          // Exit edit mode after saving
          setIsEditMode(false);
        })
        .catch((error) => {
          toast.error(
            `Failed to update profile: ${error.message || "Unknown error"}`
          );
        });
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (userData?.fullName) {
      const nameParts = userData.fullName.split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(
          0
        )}`.toUpperCase();
      }
      return userData.fullName.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Close modal and reset edit mode
  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return "N/A";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "N/A";
    }
  };

  // Join date display
  const formatJoinDate = () => {
    if (userData?.createdAt) {
      return formatDate(userData.createdAt);
    }
    return "N/A";
  };

  // Last login display (mock data if not available)
  const getLastLogin = () => {
    if (userData?.lastLogin) {
      return formatDate(userData.lastLogin);
    }
    return formatDate(new Date());
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity z-[9999]"
        onClick={handleClose}
        aria-hidden="true"
      ></div>

      {/* Modal Content */}
      <div className="flex items-center justify-center min-h-screen p-4 z-[10000]">
        <div
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-[fadeIn_0.3s_ease-out] z-[10000]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-[10000] p-2 rounded-full bg-white/90 text-gray-700 hover:bg-gray-200 transition-colors shadow-md"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success notification */}
          {showSaveSuccess && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[10010] bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-lg shadow-md flex items-center">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              Profile updated successfully
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center p-16">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-6 text-gray-600 font-medium text-lg">
                  Loading profile information...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-12">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <X className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Error Loading Profile
                </h2>
                <p className="text-center text-gray-600 mb-8">{error}</p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-700 px-4 sm:px-8 py-6 sm:py-10 rounded-t-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%27100%27%20height%3D%27100%27%20viewBox%3D%270%200%20100%20100%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M11%2018c3.866%200%207-3.134%207-7s-3.134-7-7-7-7%203.134-7%207%203.134%207%207%207zm48%2025c3.866%200%207-3.134%207-7s-3.134-7-7-7-7%203.134-7%207%203.134%207%207%207zm-43-7c1.657%200%203-1.343%203-3s-1.343-3-3-3-3%201.343-3%203%201.343%203%203%203zm63%2031c1.657%200%203-1.343%203-3s-1.343-3-3-3-3%201.343-3%203%201.343%203%203%203zM34%2090c1.657%200%203-1.343%203-3s-1.343-3-3-3-3%201.343-3%203%201.343%203%203%203zm56-76c1.657%200%203-1.343%203-3s-1.343-3-3-3-3%201.343-3%203%201.343%203%203%203zM12%2086c2.21%200%204-1.79%204-4s-1.79-4-4-4-4%201.79-4%204%201.79%204%204%204zm28-65c2.21%200%204-1.79%204-4s-1.79-4-4-4-4%201.79-4%204%201.79%204%204%204zm23-11c2.76%200%205-2.24%205-5s-2.24-5-5-5-5%202.24-5%205%202.24%205%205%205zm-6%2060c2.21%200%204-1.79%204-4s-1.79-4-4-4-4%201.79-4%204%201.79%204%204%204zm29%2022c2.76%200%205-2.24%205-5s-2.24-5-5-5-5%202.24-5%205%202.24%205%205%205zM32%2063c2.76%200%205-2.24%205-5s-2.24-5-5-5-5%202.24-5%205%202.24%205%205%205zm57-13c2.76%200%205-2.24%205-5s-2.24-5-5-5-5%202.24-5%205%202.24%205%205%205zm-9-21c1.105%200%202-.895%202-2s-.895-2-2-2-2%20.895-2%202%20.895%202%202%202zM60%2091c1.105%200%202-.895%202-2s-.895-2-2-2-2%20.895-2%202%20.895%202%202%202zM35%2041c1.105%200%202-.895%202-2s-.895-2-2-2-2%20.895-2%202%20.895%202%202%202zM12%2060c1.105%200%202-.895%202-2s-.895-2-2-2-2%20.895-2%202%20.895%202%202%202z%27%20fill%3D%27%23ffffff%27%20fill-opacity%3D%270.1%27%20fill-rule%3D%27evenodd%27%2F%3E%3C%2Fsvg%3E')] opacity-10"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white flex items-center justify-center text-green-600 font-bold text-2xl sm:text-3xl shadow-lg ring-4 ring-white/30">
                    {getInitials()}
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                          {userData?.fullName || "User Profile"}
                        </h1>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-green-100">
                          <p className="flex items-center justify-center md:justify-start">
                            <User className="w-4 h-4 mr-1.5 opacity-80" />
                            <span className="capitalize">
                              {userData?.role || "User"}
                            </span>
                          </p>
                          <p className="flex items-center justify-center md:justify-start">
                            <Mail className="w-4 h-4 mr-1.5 opacity-80" />
                            <span className="break-all">
                              {userData?.email || "No email provided"}
                            </span>
                          </p>
                          <p className="flex items-center justify-center md:justify-start">
                            <Clock className="w-4 h-4 mr-1.5 opacity-80" />
                            <span>Joined {formatJoinDate()}</span>
                          </p>
                          <div className="flex items-center justify-center md:justify-start bg-green-800 bg-opacity-25 px-2 py-0.5 rounded-full self-center md:self-auto">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-100" />
                            <span className="text-sm">Active</span>
                          </div>
                        </div>
                      </div>
                      {!isEditMode && (
                        <button
                          onClick={() => setIsEditMode(true)}
                          className="hidden md:flex mt-4 md:mt-0 px-3 py-1 bg-white text-green-700 text-sm font-medium rounded-md hover:bg-green-50 transition-all duration-200 items-center shadow-md"
                        >
                          <Edit className="w-4 h-4 mr-1.5" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Navigation */}
              {!isEditMode && (
                <div className="border-b border-gray-200 px-4 md:px-8 overflow-x-auto">
                  <div className="flex space-x-4 sm:space-x-8 whitespace-nowrap">
                    <button
                      onClick={() => setActiveTab("personal")}
                      className={`py-4 px-1 font-medium text-sm border-b-2 ${
                        activeTab === "personal"
                          ? "border-green-600 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      } transition-colors whitespace-nowrap flex items-center`}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Personal Info
                    </button>
                    <button
                      onClick={() => setActiveTab("bio")}
                      className={`py-4 px-1 font-medium text-sm border-b-2 ${
                        activeTab === "bio"
                          ? "border-green-600 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      } transition-colors whitespace-nowrap flex items-center`}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Bio & Notes
                    </button>
                    <button
                      onClick={() => setActiveTab("account")}
                      className={`py-4 px-1 font-medium text-sm border-b-2 ${
                        activeTab === "account"
                          ? "border-green-600 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      } transition-colors whitespace-nowrap flex items-center`}
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Account Details
                    </button>
                    <button
                      onClick={confirmLogout}
                      className="py-4 px-1 font-medium text-sm border-b-2 border-transparent text-red-500 hover:text-red-700 transition-colors whitespace-nowrap flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}

              {/* Profile Content */}
              <div className="p-4 md:p-8">
                {isEditMode ? (
                  // Edit Mode: Show Form
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-green-600" />
                        Personal Information
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <User className="w-4 h-4 mr-2 text-gray-500" />
                            Full Name
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className={`block w-full px-4 py-3 border ${
                              formErrors.fullName
                                ? "border-red-300 ring-red-200"
                                : "border-gray-300"
                            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors`}
                            placeholder="Enter your full name"
                          />
                          {formErrors.fullName && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.fullName}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <Mail className="w-4 h-4 mr-2 text-gray-500" />
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 cursor-not-allowed"
                            disabled // Email cannot be updated
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Email cannot be changed
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <Phone className="w-4 h-4 mr-2 text-gray-500" />
                            Phone Number
                          </label>
                          <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className={`block w-full px-4 py-3 border ${
                              formErrors.phoneNumber
                                ? "border-red-300 ring-red-200"
                                : "border-gray-300"
                            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors`}
                            placeholder="Enter your phone number"
                          />
                          {formErrors.phoneNumber && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.phoneNumber}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            Address
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className={`block w-full px-4 py-3 border ${
                              formErrors.address
                                ? "border-red-300 ring-red-200"
                                : "border-gray-300"
                            } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors`}
                            placeholder="Enter your address"
                          />
                          {formErrors.address && (
                            <p className="mt-1 text-sm text-red-600">
                              {formErrors.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-green-600" />
                        Bio & Notes
                      </h2>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <FileText className="w-4 h-4 mr-2 text-gray-500" />
                            Bio
                          </label>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows={4}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                            placeholder="Tell us about yourself..."
                          ></textarea>
                          <p className="text-xs text-gray-500 mt-1">
                            Brief description visible to other users
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center text-sm font-medium text-gray-700">
                            <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
                            Personal Notes
                          </label>
                          <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={4}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                            placeholder="Your personal notes or preferences..."
                          ></textarea>
                          <p className="text-xs text-gray-500 mt-1">
                            Private notes visible only to you
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Save and Cancel Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-6 border-t border-gray-100 sticky bottom-0 bg-white pb-2 mt-8">
                      <button
                        type="button"
                        onClick={() => setIsEditMode(false)}
                        className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center shadow-sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center shadow-sm"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  // View Mode: Show User Details based on active tab
                  <>
                    {activeTab === "personal" && (
                      <div className="bg-white rounded-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-0 sm:mr-4">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Personal Information
                            </h3>
                            <p className="text-sm text-gray-500">
                              Your contact and basic information
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-gray-50 rounded-xl p-4 md:p-6">
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-500">
                              <User className="w-4 h-4 mr-2" />
                              Full Name
                            </label>
                            <p className="text-base sm:text-lg text-gray-900 font-medium break-words">
                              {userData?.fullName || "Not provided"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-500">
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </label>
                            <p className="text-base sm:text-lg text-gray-900 font-medium break-words">
                              {userData?.email || "Not provided"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-500">
                              <Phone className="w-4 h-4 mr-2" />
                              Phone Number
                            </label>
                            <p className="text-base sm:text-lg text-gray-900 font-medium">
                              {userData?.phoneNumber || "Not provided"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-500">
                              <MapPin className="w-4 h-4 mr-2" />
                              Address
                            </label>
                            <p className="text-base sm:text-lg text-gray-900 font-medium break-words">
                              {userData?.address || "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "bio" && (
                      <div className="space-y-8">
                        <div className="bg-white rounded-xl">
                          <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-0 sm:mr-4">
                              <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                Bio & Notes
                              </h3>
                              <p className="text-sm text-gray-500">
                                Your profile description and personal notes
                              </p>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="flex items-center text-sm font-medium text-gray-500">
                                <FileText className="w-4 h-4 mr-2" />
                                Bio
                              </label>
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 min-h-24">
                                {formData.bio ? (
                                  <p className="text-gray-800 whitespace-pre-line break-words">
                                    {formData.bio}
                                  </p>
                                ) : (
                                  <p className="text-gray-500 italic">
                                    No bio information provided yet.
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center text-sm font-medium text-gray-500">
                                <BookOpen className="w-4 h-4 mr-2" />
                                Personal Notes
                              </label>
                              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 min-h-24">
                                {formData.notes ? (
                                  <p className="text-gray-800 whitespace-pre-line break-words">
                                    {formData.notes}
                                  </p>
                                ) : (
                                  <p className="text-gray-500 italic">
                                    No personal notes added yet.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "account" && (
                      <div className="space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-0 sm:mr-4">
                            <UserCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Account Information
                            </h3>
                            <p className="text-sm text-gray-500">
                              Details about your account and system access
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 md:p-6 rounded-xl">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                              <div className="flex items-center">
                                <Shield className="w-5 h-5 text-indigo-500 mr-3" />
                                <span className="font-medium text-gray-700">
                                  Account Status
                                </span>
                              </div>
                              <div className="flex items-center">
                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  <span className="text-xs font-medium">
                                    Active
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                              <div className="flex items-center">
                                <User className="w-5 h-5 text-indigo-500 mr-3" />
                                <span className="font-medium text-gray-700">
                                  Username
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-900 break-words">
                                  {userData?.userName ||
                                    userData?.email?.split("@")[0] ||
                                    "user"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                              <div className="flex items-center">
                                <Calendar className="w-5 h-5 text-indigo-500 mr-3" />
                                <span className="font-medium text-gray-700">
                                  Member Since
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-900">
                                  {formatJoinDate()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Clock className="w-5 h-5 text-indigo-500 mr-3" />
                                <span className="font-medium text-gray-700">
                                  Last Login
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-900">
                                  {getLastLogin()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mobile Edit Button */}
                    <div className="md:hidden flex justify-center mt-8">
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center shadow-md w-full"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Links */}
              {!isEditMode && (
                <div className="px-4 sm:px-6 pb-6 md:px-8 md:pb-8 bg-gray-50 border-t border-gray-100 mt-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3 pt-6">
                    Quick Actions
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate("/trips")}
                      className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm shadow-sm flex items-center"
                    >
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      View Trips
                    </button>
                    <button
                      onClick={() => navigate("/payment-methods")}
                      className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm shadow-sm flex items-center"
                    >
                      <Shield className="w-4 h-4 mr-2 text-gray-500" />
                      Payment Methods
                    </button>
                    <button
                      onClick={() => navigate("/helpcenter")}
                      className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm shadow-sm flex items-center"
                    >
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      Contact Support
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
