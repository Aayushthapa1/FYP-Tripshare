// src/admin/components/AdminProfile.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getUserProfile,
  updateUserProfileAction,
} from "../../Slices/userSlice";
import { Toaster, toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Home,
  ChevronLeft,
  Shield,
  Calendar,
  Clock,
  CheckCircle2,
  Briefcase,
  Building,
  AlertTriangle,
  UserCheck,
  LogOut,
} from "lucide-react";

const AdminProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get admin's id from the auth slice
  const adminId = useSelector((state) => state.auth.user?._id);
  const { user: authUser } = useSelector((state) => state.auth);

  // Fetch admin profile data when adminId is available
  useEffect(() => {
    if (adminId) {
      dispatch(getUserProfile(adminId));
    }
  }, [dispatch, adminId]);

  const { loading, error, success } = useSelector((state) => state.user);
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
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState("personal"); // personal, account

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

  // Show success toast when profile is updated
  useEffect(() => {
    if (success) {
      toast.success("Profile updated successfully!");
    }
  }, [success]);

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

  // Handle form submission to update profile data
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    if (adminId) {
      dispatch(
        updateUserProfileAction({ userId: adminId, userData: formData })
      );
      setIsEditMode(false);
    }
  };

  // Get initials for avatar if no profile picture exists
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
    return "A";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get account creation date (or mock one if not available)
  const getJoinDate = () => {
    if (userData?.createdAt) {
      return formatDate(userData.createdAt);
    }
    return formatDate(authUser?.createdAt || new Date("2021-01-01"));
  };

  // Get last login date (or mock one if not available)
  const getLastLogin = () => {
    if (authUser?.lastLogin) {
      return formatDate(authUser.lastLogin);
    }
    return formatDate(new Date());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Error Loading Profile
            </h2>
            <p className="text-center text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => dispatch(getUserProfile(adminId))}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" richColors />

      {/* Navigation Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/admin")}
            className="text-green-600 hover:text-green-700 flex items-center font-medium"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <div className="md:col-span-1">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-green-600 to-green-700 px-6 py-8 flex flex-col items-center">
                <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center text-green-600 font-bold text-3xl shadow-md ring-4 ring-green-200 mb-4">
                  {userData?.profilePicture ? (
                    <img
                      src={userData.profilePicture}
                      alt="Profile"
                      className="object-cover h-full w-full rounded-full"
                    />
                  ) : (
                    getInitials()
                  )}
                </div>
                <h2 className="text-xl font-bold text-white text-center">
                  {userData?.fullName || "Admin Profile"}
                </h2>
                <div className="inline-flex items-center px-3 py-1 mt-2 rounded-full bg-green-800 bg-opacity-25 text-green-50 text-sm font-medium">
                  <Shield className="w-3.5 h-3.5 mr-1" />
                  {userData?.role
                    ? `${
                        userData.role.charAt(0).toUpperCase() +
                        userData.role.slice(1)
                      }`
                    : "Administrator"}
                </div>
              </div>

              {/* Sidebar Navigation */}
              <div className="p-4">
                <nav className="space-y-1">
                  <button
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "personal"
                        ? "bg-green-50 text-green-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setActiveTab("personal")}
                  >
                    <User className="w-5 h-5 mr-3" />
                    <span className="font-medium">Personal Information</span>
                  </button>
                  <button
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                      activeTab === "account"
                        ? "bg-green-50 text-green-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setActiveTab("account")}
                  >
                    <UserCheck className="w-5 h-5 mr-3" />
                    <span className="font-medium">Account Details</span>
                  </button>
                </nav>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="px-4 space-y-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <p className="text-gray-400">Account created</p>
                        <p className="font-medium text-gray-600 mt-0.5">
                          {getJoinDate()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <p className="text-gray-400">Last login</p>
                        <p className="font-medium text-gray-600 mt-0.5">
                          {getLastLogin()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <div className="mt-6 px-4">
                  <button
                    onClick={() => {
                      // Handle logout (you would typically dispatch a logout action here)
                      toast.info("Logout functionality would go here");
                    }}
                    className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Content Header */}
              <div className="border-b border-gray-200 px-6 py-4">
                <h1 className="text-xl font-semibold text-gray-800">
                  {activeTab === "personal"
                    ? "Personal Information"
                    : "Account Details"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === "personal"
                    ? "Manage your personal information and contact details"
                    : "View your account information and system access details"}
                </p>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "personal" ? (
                  // Personal Information Tab
                  isEditMode ? (
                    // Edit Mode: Show Form
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-6">
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
                            disabled
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
                    // View Mode: Show Admin Personal Details
                    <>
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex items-center mb-4 md:mb-0">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
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
                          <button
                            onClick={() => setIsEditMode(true)}
                            className="inline-flex items-center px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg transition-colors duration-200"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Information
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 bg-gray-50 p-6 rounded-xl">
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
                      </div>

                      {/* Department & Position (optional section that could be real or mocked) */}
                      <div className="mt-10 pt-6 border-t border-gray-200">
                        <div className="flex items-center mb-6">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                            <Briefcase className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              Work Information
                            </h3>
                            <p className="text-sm text-gray-500">
                              Your role and department details
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 bg-gray-50 p-6 rounded-xl">
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-500">
                              <Shield className="w-4 h-4 mr-2" />
                              Role
                            </label>
                            <p className="text-lg text-gray-900 font-medium">
                              {userData?.role
                                ? userData.role.charAt(0).toUpperCase() +
                                  userData.role.slice(1)
                                : "Administrator"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="flex items-center text-sm font-medium text-gray-500">
                              <Building className="w-4 h-4 mr-2" />
                              Department
                            </label>
                            <p className="text-lg text-gray-900 font-medium">
                              {userData?.department || "Management"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                ) : (
                  // Account Details Tab
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex items-center mb-4 md:mb-0">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
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
                    </div>

                    <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-xl">
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
                              <span className="text-gray-900">
                                {userData?.userName ||
                                  userData?.email?.split("@")[0] ||
                                  "admin"}
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
                                {getJoinDate()}
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

                      {/* Permissions Section (mocked) */}
                      <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          System Permissions
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-6">
                          <ul className="space-y-3">
                            <li className="flex items-center">
                              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                              <span className="text-gray-700">
                                User Management
                              </span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                              <span className="text-gray-700">
                                Content Management
                              </span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                              <span className="text-gray-700">
                                Trip Management
                              </span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                              <span className="text-gray-700">
                                Booking Management
                              </span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                              <span className="text-gray-700">
                                Payment Management
                              </span>
                            </li>
                            <li className="flex items-center">
                              <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                              <span className="text-gray-700">
                                System Settings
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
