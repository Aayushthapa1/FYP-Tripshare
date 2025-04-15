"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchVerifiedUserKYC } from "../../Slices/userKYCSlice";
import {
  FileCheck,
  RefreshCw,
  User,
  Mail,
  Calendar,
  Phone,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  Search,
} from "lucide-react";

const VerifiedUsersPage = () => {
  const dispatch = useDispatch();
  const { verifiedUsers, loading, error } = useSelector(
    (state) => state.userKYC
  );

  // Local states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedUser, setExpandedUser] = useState(null);
  const [viewImage, setViewImage] = useState(null);

  useEffect(() => {
    dispatch(fetchVerifiedUserKYC());
  }, [dispatch]);

  // Toggle expanded view for a user
  const toggleExpand = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  // Refresh the list
  const handleRefresh = () => {
    dispatch(fetchVerifiedUserKYC());
  };

  // Filter users based on search term
  const filteredUsers = verifiedUsers
    ? verifiedUsers.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.fullName.localeCompare(b.fullName)
        : b.fullName.localeCompare(a.fullName);
    } else if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }
    return 0;
  });

  // Format date
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="bg-green-50 p-2 rounded-lg mr-3">
              <FileCheck className="text-green-600" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Verified Users</h1>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-64 bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
              <button
                onClick={handleRefresh}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Refresh list"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Sort by:</span>
            <button
              onClick={() => {
                setSortBy("name");
                setSortOrder(
                  sortBy === "name" && sortOrder === "asc" ? "desc" : "asc"
                );
              }}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${
                sortBy === "name"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
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
              className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${
                sortBy === "date"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>
          <div className="text-sm font-medium text-gray-600">
            {filteredUsers.length}{" "}
            {filteredUsers.length === 1 ? "user" : "users"} verified
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="text-gray-600 font-medium">
              Loading verified users...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm mb-6">
            <p className="font-medium mb-1">Error loading verified users</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredUsers.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-8 h-8 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Verified Users
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm
                ? "No results match your search criteria."
                : "There are no verified users at the moment."}
            </p>
          </div>
        )}

        {/* User Cards */}
        {sortedUsers.length > 0 && (
          <div className="space-y-4">
            {sortedUsers.map((user) => (
              <div
                key={user._id}
                className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 bg-white shadow-sm hover:shadow-md"
              >
                {/* Card Header */}
                <div className="p-5 flex flex-wrap items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {user.fullName}
                      </h2>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Mail className="w-4 h-4 mr-1.5" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 mt-4 md:mt-0">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                    <button
                      onClick={() => toggleExpand(user._id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors duration-200"
                      aria-label={
                        expandedUser === user._id
                          ? "Collapse details"
                          : "Expand details"
                      }
                    >
                      {expandedUser === user._id ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedUser === user._id && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
                      {/* User Details */}
                      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
                          User Information
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <div className="bg-gray-50 p-2 rounded-md mr-3">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Full Name</p>
                              <p className="font-medium text-gray-900 mt-0.5">
                                {user.fullName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <div className="bg-gray-50 p-2 rounded-md mr-3">
                              <Mail className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Email Address
                              </p>
                              <p className="font-medium text-gray-900 mt-0.5">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          {user.phone && (
                            <div className="flex items-start">
                              <div className="bg-gray-50 p-2 rounded-md mr-3">
                                <Phone className="w-5 h-5 text-gray-500" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Phone Number
                                </p>
                                <p className="font-medium text-gray-900 mt-0.5">
                                  {user.phone}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-start">
                            <div className="bg-gray-50 p-2 rounded-md mr-3">
                              <Calendar className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Verification Date
                              </p>
                              <p className="font-medium text-gray-900 mt-0.5">
                                {formatDate(user.updatedAt || user.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Document Preview */}
                      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">
                          KYC Documents
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {user.citizenshipFront && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                              <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                                <img
                                  src={
                                    user.citizenshipFront || "/placeholder.svg"
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
                                      user.citizenshipFront,
                                      "Citizenship Front"
                                    )
                                  }
                                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200"
                                >
                                  <Eye className="w-6 h-6 text-white opacity-0 hover:opacity-100" />
                                </button>
                              </div>
                              <div className="p-3 text-center bg-gray-50 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-700">
                                  Citizenship Front
                                </p>
                              </div>
                            </div>
                          )}

                          {user.citizenshipBack && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                              <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                                <img
                                  src={
                                    user.citizenshipBack || "/placeholder.svg"
                                  }
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
                                      user.citizenshipBack,
                                      "Citizenship Back"
                                    )
                                  }
                                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200"
                                >
                                  <Eye className="w-6 h-6 text-white opacity-0 hover:opacity-100" />
                                </button>
                              </div>
                              <div className="p-3 text-center bg-gray-50 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-700">
                                  Citizenship Back
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
      </div>

      {/* Image Viewer Modal */}
      {viewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm"
          onClick={closeImageModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-medium text-gray-800">{viewImage.title}</h3>
              <button
                onClick={closeImageModal}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 flex items-center justify-center bg-gray-100 max-h-[70vh] overflow-auto">
              <img
                src={viewImage.url || "/placeholder.svg"}
                alt={viewImage.title}
                className="max-w-full max-h-full object-contain shadow-lg"
              />
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={closeImageModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-gray-500"
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
