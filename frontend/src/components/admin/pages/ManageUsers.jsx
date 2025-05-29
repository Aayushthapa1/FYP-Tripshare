"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVerifiedUserKYC } from "../../Slices/userKYCSlice";
import { fetchVerifiedDriverKYC } from "../../Slices/driverKYCSlice";
import {
  FileCheck,
  RefreshCw,
  User,
  Mail,
  Calendar,
  Phone,
  ChevronDown,
  Eye,
  X,
  Search,
  Car,
  Filter,
  CheckCircle,
  UserCheck,
} from "lucide-react";

const VerifiedUsersPage = () => {
  const dispatch = useDispatch();

  // Get data from Redux store
  const {
    verifiedUsers,
    loading: userLoading,
    error: userError,
  } = useSelector((state) => state.userKYC);

  const {
    verifiedDrivers, // FIXED: Directly accessing verifiedDrivers instead of submissions
    loading: driverLoading,
    error: driverError,
  } = useSelector((state) => state.driverKYC);

  // Local states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedItem, setExpandedItem] = useState(null);
  const [viewImage, setViewImage] = useState(null);
  const [filterType, setFilterType] = useState("all"); // 'all', 'user', 'driver'

  useEffect(() => {
    // Fetch both users and drivers KYC data
    dispatch(fetchVerifiedUserKYC());
    dispatch(fetchVerifiedDriverKYC());
  }, [dispatch]);

  // Toggle expanded view for a user or driver
  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  // Refresh the list
  const handleRefresh = () => {
    dispatch(fetchVerifiedUserKYC());
    dispatch(fetchVerifiedDriverKYC());
  };

  // Clear search term
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Filter verified users
  const filteredUsers = verifiedUsers
    ? verifiedUsers.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Filter verified drivers
  const filteredDrivers = verifiedDrivers
    ? verifiedDrivers.filter(
        (driver) =>
          driver.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.user?.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          driver.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Combine and prepare data based on filter
  const combinedData = [];

  if (filterType === "all" || filterType === "user") {
    filteredUsers.forEach((user) => {
      combinedData.push({
        ...user,
        type: "user",
      });
    });
  }

  if (filterType === "all" || filterType === "driver") {
    filteredDrivers.forEach((driver) => {
      combinedData.push({
        ...driver,
        type: "driver",
      });
    });
  }

  // Sort combined data
  const sortedData = [...combinedData].sort((a, b) => {
    if (sortBy === "name") {
      const nameA = a.fullName || a.user?.fullName || "";
      const nameB = b.fullName || b.user?.fullName || "";
      return sortOrder === "asc"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } else if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        : new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (sortBy === "type") {
      return sortOrder === "asc"
        ? a.type.localeCompare(b.type)
        : b.type.localeCompare(a.type);
    }
    return 0;
  });

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // View image in modal
  const openImageModal = (imageUrl, title) => {
    setViewImage({ url: imageUrl, title });
  };

  // Close image modal
  const closeImageModal = () => {
    setViewImage(null);
  };

  // Get full name based on item type
  const getFullName = (item) => {
    if (item.type === "driver") {
      return item.fullName || item.user?.fullName || "Unknown Driver";
    }
    return item.fullName || "Unknown User";
  };

  // Get email based on item type
  const getEmail = (item) => {
    if (item.type === "driver") {
      return item.email || item.user?.email || "No email";
    }
    return item.email || "No email";
  };

  // Check if data is loading
  const isLoading = userLoading || driverLoading;

  // Check for errors
  const hasError = userError || driverError;
  const errorMessage = userError || driverError || "";

  return (
    <div className="space-y-8 bg-slate-50 p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Verified Accounts
            </h1>
            <p className="text-slate-500 mt-2 text-base md:text-lg">
              View and manage all verified user and driver accounts
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-full md:w-64 bg-slate-50"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
              <button
                onClick={handleRefresh}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                title="Refresh list"
              >
                <RefreshCw
                  size={16}
                  className={isLoading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Sorting & Filtering Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Sort by:</span>
            <button
              onClick={() => {
                setSortBy("name");
                setSortOrder(
                  sortBy === "name" && sortOrder === "asc" ? "desc" : "asc"
                );
              }}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                sortBy === "name"
                  ? "bg-emerald-50 text-emerald-600 font-medium"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => {
                setSortBy("date");
                setSortOrder(
                  sortBy === "date" && sortOrder === "asc" ? "desc" : "asc"
                );
              }}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                sortBy === "date"
                  ? "bg-emerald-50 text-emerald-600 font-medium"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => {
                setSortBy("type");
                setSortOrder(
                  sortBy === "type" && sortOrder === "asc" ? "desc" : "asc"
                );
              }}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                sortBy === "type"
                  ? "bg-emerald-50 text-emerald-600 font-medium"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Type {sortBy === "type" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-xl">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filterType === "all"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("user")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filterType === "user"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <User className="inline mr-1 sm:mr-2 h-4 w-4" /> Users
              </button>
              <button
                onClick={() => setFilterType("driver")}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filterType === "driver"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Car className="inline mr-1 sm:mr-2 h-4 w-4" /> Drivers
              </button>
            </div>

            <div className="text-sm font-medium text-slate-600 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg flex items-center">
              <CheckCircle className="inline mr-2 h-4 w-4" />
              {sortedData.length}{" "}
              {sortedData.length === 1 ? "account" : "accounts"} verified
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12 md:py-16 bg-white rounded-2xl shadow-lg border border-slate-100">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <p className="text-slate-600 text-lg">Loading verified accounts...</p>
        </div>
      )}

      {/* Error State */}
      {hasError && !isLoading && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-6 rounded-2xl shadow-md mb-6">
          <div className="flex items-center mb-2">
            <div className="bg-rose-100 p-2 rounded-full mr-3">
              <X className="h-5 w-5 text-rose-600" />
            </div>
            <p className="font-semibold text-lg">
              Error loading verified accounts
            </p>
          </div>
          <p className="ml-10">{errorMessage}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !hasError && sortedData.length === 0 && (
        <div className="text-center py-12 md:py-16 bg-white rounded-2xl shadow-lg border border-slate-100">
          <div className="bg-slate-100 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mx-auto mb-6">
            <UserCheck className="w-8 h-8 md:w-10 md:h-10 text-slate-400" />
          </div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800 mb-3">
            No Verified Accounts
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-base md:text-lg px-4">
            {searchTerm
              ? "No results match your search criteria."
              : `There are no verified ${
                  filterType === "user"
                    ? "users"
                    : filterType === "driver"
                    ? "drivers"
                    : "accounts"
                } at the moment.`}
          </p>
        </div>
      )}

      {/* User/Driver Cards */}
      {sortedData.length > 0 && (
        <div className="space-y-6">
          {sortedData.map((item) => (
            <div
              key={item._id}
              className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 bg-white shadow-md hover:shadow-lg"
            >
              {/* Card Header */}
              <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                      item.type === "driver"
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                        : "bg-gradient-to-br from-emerald-500 to-teal-600"
                    }`}
                  >
                    {item.type === "driver" ? (
                      <Car className="w-6 h-6 text-white" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold text-slate-800">
                      {getFullName(item)}
                    </h2>
                    <div className="flex items-center text-sm text-slate-500 mt-1">
                      <Mail className="w-4 h-4 mr-1.5" />
                      {getEmail(item)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                      item.type === "driver"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {item.type === "driver" ? "Driver" : "User"}
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verified
                  </span>
                  <button
                    onClick={() => toggleExpand(item._id)}
                    className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors duration-200"
                    aria-label={
                      expandedItem === item._id
                        ? "Collapse details"
                        : "Expand details"
                    }
                  >
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${
                        expandedItem === item._id ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedItem === item._id && (
                <div className="border-t border-slate-100 bg-slate-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-4 md:p-6">
                    {/* User/Driver Details */}
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-md border border-slate-100">
                      <h3 className="text-sm font-medium text-slate-500 mb-4 md:mb-5 uppercase tracking-wider">
                        {item.type === "driver" ? "Driver" : "User"} Information
                      </h3>
                      <div className="space-y-4 md:space-y-5">
                        <div className="flex items-start">
                          <div className="bg-slate-100 p-2.5 rounded-lg mr-4 shadow-sm">
                            <User className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Full Name</p>
                            <p className="font-medium text-slate-900 mt-1">
                              {getFullName(item)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-slate-100 p-2.5 rounded-lg mr-4 shadow-sm">
                            <Mail className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">
                              Email Address
                            </p>
                            <p className="font-medium text-slate-900 mt-1">
                              {getEmail(item)}
                            </p>
                          </div>
                        </div>
                        {(item.phone || item.phoneNumber) && (
                          <div className="flex items-start">
                            <div className="bg-slate-100 p-2.5 rounded-lg mr-4 shadow-sm">
                              <Phone className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">
                                Phone Number
                              </p>
                              <p className="font-medium text-slate-900 mt-1">
                                {item.phone || item.phoneNumber || "N/A"}
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-start">
                          <div className="bg-slate-100 p-2.5 rounded-lg mr-4 shadow-sm">
                            <Calendar className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">
                              Verification Date
                            </p>
                            <p className="font-medium text-slate-900 mt-1">
                              {formatDate(item.updatedAt || item.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Driver specific info */}
                        {item.type === "driver" && item.vehicleDetails && (
                          <div className="flex items-start">
                            <div className="bg-slate-100 p-2.5 rounded-lg mr-4 shadow-sm">
                              <Car className="w-5 h-5 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">
                                Vehicle Details
                              </p>
                              <p className="font-medium text-slate-900 mt-1">
                                {item.vehicleDetails.model || "N/A"} (
                                {item.vehicleDetails.plateNumber || "N/A"})
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Document Preview */}
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-md border border-slate-100">
                      <h3 className="text-sm font-medium text-slate-500 mb-4 md:mb-5 uppercase tracking-wider">
                        KYC Documents
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Citizenship Front for Users */}
                        {item.type === "user" && item.citizenshipFront && (
                          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="aspect-w-16 aspect-h-9 bg-slate-100 relative">
                              <img
                                src={
                                  item.citizenshipFront || "/placeholder.svg"
                                }
                                alt="Citizenship Front"
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.src =
                                    "/placeholder.svg?height=150&width=250";
                                }}
                              />
                              <button
                                onClick={() =>
                                  openImageModal(
                                    item.citizenshipFront,
                                    "Citizenship Front"
                                  )
                                }
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200"
                              >
                                <Eye className="w-8 h-8 text-white opacity-0 hover:opacity-100 transform scale-75 hover:scale-100 transition-all duration-200" />
                              </button>
                            </div>
                            <div className="p-3 text-center bg-slate-50 border-t border-slate-100">
                              <p className="text-sm font-medium text-slate-700">
                                Citizenship Front
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Citizenship Back for Users */}
                        {item.type === "user" && item.citizenshipBack && (
                          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="aspect-w-16 aspect-h-9 bg-slate-100 relative">
                              <img
                                src={item.citizenshipBack || "/placeholder.svg"}
                                alt="Citizenship Back"
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.src =
                                    "/placeholder.svg?height=150&width=250";
                                }}
                              />
                              <button
                                onClick={() =>
                                  openImageModal(
                                    item.citizenshipBack,
                                    "Citizenship Back"
                                  )
                                }
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200"
                              >
                                <Eye className="w-8 h-8 text-white opacity-0 hover:opacity-100 transform scale-75 hover:scale-100 transition-all duration-200" />
                              </button>
                            </div>
                            <div className="p-3 text-center bg-slate-50 border-t border-slate-100">
                              <p className="text-sm font-medium text-slate-700">
                                Citizenship Back
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Driver's License for Drivers */}
                        {item.type === "driver" && item.driverLicenseImage && (
                          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="aspect-w-16 aspect-h-9 bg-slate-100 relative">
                              <img
                                src={
                                  item.driverLicenseImage ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg"
                                }
                                alt="Driver's License"
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.src =
                                    "/placeholder.svg?height=150&width=250";
                                }}
                              />
                              <button
                                onClick={() =>
                                  openImageModal(
                                    item.driverLicenseImage,
                                    "Driver's License"
                                  )
                                }
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200"
                              >
                                <Eye className="w-8 h-8 text-white opacity-0 hover:opacity-100 transform scale-75 hover:scale-100 transition-all duration-200" />
                              </button>
                            </div>
                            <div className="p-3 text-center bg-slate-50 border-t border-slate-100">
                              <p className="text-sm font-medium text-slate-700">
                                Driver's License
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Vehicle Registration for Drivers */}
                        {item.type === "driver" &&
                          item.vehicleRegistrationImage && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300">
                              <div className="aspect-w-16 aspect-h-9 bg-slate-100 relative">
                                <img
                                  src={
                                    item.vehicleRegistrationImage ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg"
                                  }
                                  alt="Vehicle Registration"
                                  className="object-cover w-full h-full"
                                  onError={(e) => {
                                    e.target.src =
                                      "/placeholder.svg?height=150&width=250";
                                  }}
                                />
                                <button
                                  onClick={() =>
                                    openImageModal(
                                      item.vehicleRegistrationImage,
                                      "Vehicle Registration"
                                    )
                                  }
                                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200"
                                >
                                  <Eye className="w-8 h-8 text-white opacity-0 hover:opacity-100 transform scale-75 hover:scale-100 transition-all duration-200" />
                                </button>
                              </div>
                              <div className="p-3 text-center bg-slate-50 border-t border-slate-100">
                                <p className="text-sm font-medium text-slate-700">
                                  Vehicle Registration
                                </p>
                              </div>
                            </div>
                          )}

                        {/* Insurance Document for Drivers */}
                        {item.type === "driver" && item.insuranceImage && (
                          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300">
                            <div className="aspect-w-16 aspect-h-9 bg-slate-100 relative">
                              <img
                                src={item.insuranceImage || "/placeholder.svg"}
                                alt="Insurance Document"
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.src =
                                    "/placeholder.svg?height=150&width=250";
                                }}
                              />
                              <button
                                onClick={() =>
                                  openImageModal(
                                    item.insuranceImage,
                                    "Insurance Document"
                                  )
                                }
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200"
                              >
                                <Eye className="w-8 h-8 text-white opacity-0 hover:opacity-100 transform scale-75 hover:scale-100 transition-all duration-200" />
                              </button>
                            </div>
                            <div className="p-3 text-center bg-slate-50 border-t border-slate-100">
                              <p className="text-sm font-medium text-slate-700">
                                Insurance Document
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm"
          onClick={closeImageModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl md:max-w-4xl w-full overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-medium text-slate-800 text-lg">
                {viewImage.title}
              </h3>
              <button
                onClick={closeImageModal}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <div className="p-4 md:p-6 flex items-center justify-center bg-slate-100 max-h-[50vh] md:max-h-[70vh] overflow-auto">
              <img
                src={viewImage.url || "/placeholder.svg"}
                alt={viewImage.title}
                className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
              />
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={closeImageModal}
                className="px-4 md:px-5 py-2 md:py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifiedUsersPage;
