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
    <div className="bg-white min-h-screen p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
          <FileCheck className="text-green-600 mr-2" size={24} />
          <h1 className="text-2xl font-bold text-gray-800">Verified Users</h1>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full md:w-64"
            />
            <button
              onClick={handleRefresh}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <button
            onClick={() => {
              setSortBy("name");
              setSortOrder(
                sortBy === "name" && sortOrder === "asc" ? "desc" : "asc"
              );
            }}
            className={`px-3 py-1 text-sm rounded-md ${
              sortBy === "name"
                ? "bg-green-50 text-green-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
            className={`px-3 py-1 text-sm rounded-md ${
              sortBy === "date"
                ? "bg-green-50 text-green-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}{" "}
          verified
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <p className="text-gray-600">Loading verified users...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Error loading verified users</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <FileCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Verified Users
          </h2>
          <p className="text-gray-500">
            {searchTerm
              ? "No results match your search criteria."
              : "There are no verified users at the moment."}
          </p>
        </div>
      )}

      {/* User Cards */}
      <div className="space-y-4">
        {sortedUsers.map((user) => (
          <div
            key={user._id}
            className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200"
          >
            {/* Card Header */}
            <div className="p-4 flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {user.fullName}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="w-4 h-4 mr-1" />
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
                <button
                  onClick={() => toggleExpand(user._id)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                  aria-label={
                    expandedUser === user._id
                      ? "Collapse details"
                      : "Expand details"
                  }
                >
                  {expandedUser === user._id ? (
                    <ChevronUp size={20} />
                  ) : (
                    <ChevronDown size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedUser === user._id && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User Details */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                      User Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <User className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Full Name</p>
                          <p className="font-medium text-gray-900">
                            {user.fullName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Mail className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Email Address</p>
                          <p className="font-medium text-gray-900">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      {user.phone && (
                        <div className="flex items-start">
                          <Phone className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">
                              Phone Number
                            </p>
                            <p className="font-medium text-gray-900">
                              {user.phone}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start">
                        <Calendar className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">
                            Verification Date
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatDate(user.updatedAt || user.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Preview */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                      KYC Documents
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {user.citizenshipFront && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                          <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                            <img
                              src={user.citizenshipFront || "/placeholder.svg"}
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
                              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200"
                            >
                              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                            </button>
                          </div>
                          <div className="p-2 text-center">
                            <p className="text-xs font-medium text-gray-700">
                              Citizenship Front
                            </p>
                          </div>
                        </div>
                      )}

                      {user.citizenshipBack && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                          <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                            <img
                              src={user.citizenshipBack || "/placeholder.svg"}
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
                              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200"
                            >
                              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                            </button>
                          </div>
                          <div className="p-2 text-center">
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

      {/* Image Viewer Modal */}
      {viewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
          onClick={closeImageModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-medium text-gray-800">{viewImage.title}</h3>
              <button
                onClick={closeImageModal}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-100 max-h-[70vh] overflow-auto">
              <img
                src={viewImage.url || "/placeholder.svg"}
                alt={viewImage.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeImageModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
