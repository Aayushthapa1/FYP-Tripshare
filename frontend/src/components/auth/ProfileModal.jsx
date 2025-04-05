import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserProfile,
  updateUserProfileAction,
} from "../Slices/userSlice.js";
import { User, Mail, Phone, MapPin, Edit, Save, X, Home } from "lucide-react";

const ProfileModal = ({ isOpen, onClose, userId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.user);
  const userData = useSelector(
    (state) => state.user?.userData?.Result?.user_data
  );

  // State for edit mode and form data
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  // Pre-fill form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        address: userData.address || "",
      });
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
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (userId) {
      dispatch(updateUserProfileAction({ userId, userData: formData }));
      setIsEditMode(false); // Exit edit mode after saving
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 text-gray-700 hover:bg-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600 font-medium">
                  Loading profile...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Error Loading Profile
                </h2>
                <p className="text-center text-gray-600 mb-6">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 sm:px-8 rounded-t-xl">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-green-600 font-bold text-2xl shadow-md">
                    {getInitials()}
                  </div>
                  <div className="text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      {userData?.fullName || "User Profile"}
                    </h1>
                    <p className="text-green-100 mt-1">
                      {userData?.role
                        ? `${
                            userData.role.charAt(0).toUpperCase() +
                            userData.role.slice(1)
                          }`
                        : "User"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-6 sm:p-8">
                {isEditMode ? (
                  // Edit Mode: Show Form
                  <form onSubmit={handleSubmit} className="space-y-6">
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
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder="Enter your full name"
                        />
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
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder="Enter your phone number"
                        />
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
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          placeholder="Enter your address"
                        />
                      </div>
                    </div>

                    {/* Save and Cancel Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setIsEditMode(false)}
                        className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  // View Mode: Show User Details
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-500">
                          <User className="w-4 h-4 mr-2" />
                          Full Name
                        </label>
                        <p className="text-lg text-gray-900 font-medium">
                          {userData?.fullName || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-500">
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </label>
                        <p className="text-lg text-gray-900 font-medium">
                          {userData?.email || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-500">
                          <Phone className="w-4 h-4 mr-2" />
                          Phone Number
                        </label>
                        <p className="text-lg text-gray-900 font-medium">
                          {userData?.phoneNumber || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-500">
                          <MapPin className="w-4 h-4 mr-2" />
                          Address
                        </label>
                        <p className="text-lg text-gray-900 font-medium">
                          {userData?.address || "Not provided"}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-6 mt-6 border-t border-gray-100">
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Quick Links */}
              <div className="px-6 pb-6 sm:px-8 sm:pb-8">
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => navigate("/trips")}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
                  >
                    View Trips
                  </button>
                  <button
                    onClick={() => navigate("/payment-methods")}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
                  >
                    Payment Methods
                  </button>
                  <button
                    onClick={() => navigate("/helpcenter")}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
