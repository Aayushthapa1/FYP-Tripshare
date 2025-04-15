import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchPendingUserKYC,
  updateUserKYCStatus,
} from "../../Slices/userKYCSlice";
import {
  fetchAllDriverKYCsAction,
  updateDriverKYCStatusAction,
} from "../../Slices/driverKYCSlice";
import {
  FileText,
  ChevronDown,
  RefreshCw,
  Check,
  X,
  User,
  Mail,
  Calendar,
  Eye,
  Car,
  CreditCard,
  Filter,
} from "lucide-react";

const AdminKYCRequests = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get data from Redux store
  const {
    pendingUsers,
    loading: userLoading,
    updateLoading: userUpdateLoading,
    error: userError,
    message: userMessage,
  } = useSelector((state) => state.userKYC);

  const {
    submissions: pendingDrivers,
    loading: driverLoading,
    error: driverError,
    status: driverStatus,
    operation: driverOperation,
  } = useSelector((state) => state.driverKYC);

  // Local states
  const [kycType, setKycType] = useState("user"); // 'user' or 'driver'
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [expandedItem, setExpandedItem] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewImage, setViewImage] = useState(null);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("pending");

  // Fetch KYC requests on mount and when type changes
  useEffect(() => {
    if (kycType === "user") {
      dispatch(fetchPendingUserKYC());
    } else {
      dispatch(fetchAllDriverKYCsAction({ status: statusFilter }));
    }
  }, [dispatch, kycType, statusFilter]);

  // Show success/error messages via toasts
  useEffect(() => {
    if (userMessage) {
      toast.success(userMessage);
    }
    if (userError) {
      toast.error(userError);
    }
    if (driverError) {
      toast.error(
        typeof driverError === "string"
          ? driverError
          : driverError.message || "An error occurred"
      );
    }
    if (driverOperation === "status" && driverStatus === "succeeded") {
      toast.success("Driver KYC status updated successfully");
    }
  }, [userMessage, userError, driverError, driverOperation, driverStatus]);

  // Handle rejection reason input
  const handleReasonChange = (id, reason) => {
    setRejectionReasons({
      ...rejectionReasons,
      [id]: reason,
    });
  };

  // Toggle expanded view for an item
  const toggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  // Set up confirmation for approve/reject
  const setupConfirmation = (action, id, itemType) => {
    if (action === "reject" && !rejectionReasons[id]?.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setConfirmAction({ action, id, itemType });
  };

  // Cancel confirmation
  const cancelConfirmation = () => {
    setConfirmAction(null);
  };

  // Approve KYC
  const handleApprove = async (id, itemType) => {
    try {
      if (itemType === "user") {
        await dispatch(
          updateUserKYCStatus({ userId: id, status: "verified" })
        ).unwrap();
      } else {
        await dispatch(
          updateDriverKYCStatusAction({
            id,
            statusData: { status: "verified" },
          })
        ).unwrap();
      }
      setConfirmAction(null);
    } catch (err) {
      toast.error(err || "Failed to approve KYC");
    }
  };

  // Reject KYC (requires a reason)
  const handleReject = async (id, itemType) => {
    const reason = rejectionReasons[id] || "";
    if (!reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      if (itemType === "user") {
        await dispatch(
          updateUserKYCStatus({
            userId: id,
            status: "rejected",
            rejectionReason: reason,
          })
        ).unwrap();
      } else {
        await dispatch(
          updateDriverKYCStatusAction({
            id,
            statusData: {
              status: "rejected",
              rejectionReason: reason,
            },
          })
        ).unwrap();
      }

      setRejectionReasons({
        ...rejectionReasons,
        [id]: "",
      });
      setConfirmAction(null);
    } catch (err) {
      toast.error(err || "Failed to reject KYC");
    }
  };

  // Needs resubmission (driver only)
  const handleNeedsResubmission = async (id) => {
    const reason = rejectionReasons[id] || "";
    if (!reason.trim()) {
      toast.error("Please provide a reason for resubmission");
      return;
    }

    try {
      await dispatch(
        updateDriverKYCStatusAction({
          id,
          statusData: {
            status: "needs_resubmission",
            rejectionReason: reason,
          },
        })
      ).unwrap();

      setRejectionReasons({
        ...rejectionReasons,
        [id]: "",
      });
      setConfirmAction(null);
    } catch (err) {
      toast.error(err || "Failed to update KYC status");
    }
  };

  // Refresh the list
  const handleRefresh = () => {
    if (kycType === "user") {
      dispatch(fetchPendingUserKYC());
    } else {
      dispatch(fetchAllDriverKYCsAction({ status: statusFilter }));
    }
  };

  // Filter items based on search term
  const getFilteredItems = () => {
    const items = kycType === "user" ? pendingUsers : pendingDrivers;
    
    if (!items) return [];
    
    return items.filter(item => {
      const fullName = kycType === "user" ? item.fullName : item.fullName;
      const email = kycType === "user" ? item.email : item.email;
      
      return (
        fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  // Sort filtered items
  const getSortedItems = () => {
    const filteredItems = getFilteredItems();
    
    return [...filteredItems].sort((a, b) => {
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
  };

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

  // Get items to display
  const items = getSortedItems();
  const loading = kycType === "user" ? userLoading : driverLoading;

  return (
    <div className="bg-white min-h-screen p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center">
          <FileText className="text-blue-600 mr-2" size={24} />
          <h1 className="text-2xl font-bold text-gray-800">
            KYC Verification Requests
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
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

      {/* KYC Type Selector and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setKycType("user")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                kycType === "user"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <User className="inline mr-1" size={16} /> User KYC
            </button>
            <button
              onClick={() => setKycType("driver")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                kycType === "driver"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Car className="inline mr-1" size={16} /> Driver KYC
            </button>
          </div>

          {kycType === "driver" && (
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="needs_resubmission">Needs Resubmission</option>
                <option value="">All Statuses</option>
              </select>
            </div>
          )}
        </div>

        {/* Sorting Controls */}
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
                ? "bg-blue-50 text-blue-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Name
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
                ? "bg-blue-50 text-blue-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Date
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <p className="text-gray-600">Loading requests...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No KYC Requests
          </h2>
          <p className="text-gray-500">
            {searchTerm
              ? "No results match your search criteria."
              : `There are no ${statusFilter || "pending"} ${kycType} KYC verification requests at the moment.`}
          </p>
        </div>
      )}

      {/* KYC Request Cards */}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item._id}
            className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200"
          >
            {/* Card Header */}
            <div className="p-4 flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  {kycType === "user" ? (
                    <User className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Car className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {item.fullName}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500">
                    <Mail className="w-4 h-4 mr-1" />
                    {item.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2 md:mt-0">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  item.status === "verified" 
                    ? "bg-green-100 text-green-800" 
                    : item.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : item.status === "needs_resubmission"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' ') : "Pending"}
                </span>
                <button
                  onClick={() => toggleExpand(item._id)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                  aria-label={
                    expandedItem === item._id
                      ? "Collapse details"
                      : "Expand details"
                  }
                >
                  <ChevronDown
                    size={20}
                    className={
                      expandedItem === item._id ? "transform rotate-180" : ""
                    }
                  />
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedItem === item._id && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* User/Driver Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                      {kycType === "user" ? "User" : "Driver"} Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <User className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Full Name</p>
                          <p className="font-medium text-gray-900">
                            {item.fullName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Mail className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Email Address</p>
                          <p className="font-medium text-gray-900">
                            {item.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Calendar className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">
                            Submission Date
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>
                      {kycType === "driver" && item.licenseNumber && (
                        <div className="flex items-start">
                          <CreditCard className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                          <div>
                            <p className="text-xs text-gray-500">
                              License Number
                            </p>
                            <p className="font-medium text-gray-900">
                              {item.licenseNumber}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Preview */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                      KYC Documents
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {kycType === "user" && (
                        <>
                          {item.citizenshipFront && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                                <img
                                  src={item.citizenshipFront || "/placeholder.svg"}
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
                          {item.citizenshipBack && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
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
                        </>
                      )}
                      {kycType === "driver" && (
                        <>
                          {item.frontPhoto && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                                <img
                                  src={item.frontPhoto || "/placeholder.svg"}
                                  alt="License Front"
                                  className="object-cover w-full h-full"
                                  onError={(e) => {
                                    e.target.src =
                                      "/placeholder.svg?height=150&width=250";
                                  }}
                                />
                                <button
                                  onClick={() =>
                                    openImageModal(
                                      item.frontPhoto,
                                      "License Front"
                                    )
                                  }
                                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200"
                                >
                                  <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                                </button>
                              </div>
                              <div className="p-2 text-center">
                                <p className="text-xs font-medium text-gray-700">
                                  License Front
                                </p>
                              </div>
                            </div>
                          )}
                          {item.backPhoto && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                                <img
                                  src={item.backPhoto || "/placeholder.svg"}
                                  alt="License Back"
                                  className="object-cover w-full h-full"
                                  onError={(e) => {
                                    e.target.src =
                                      "/placeholder.svg?height=150&width=250";
                                  }}
                                />
                                <button
                                  onClick={() =>
                                    openImageModal(
                                      item.backPhoto,
                                      "License Back"
                                    )
                                  }
                                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200"
                                >
                                  <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                                </button>
                              </div>
                              <div className="p-2 text-center">
                                <p className="text-xs font-medium text-gray-700">
                                  License Back
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rejection Reason Input */}
                <div className="mt-6">
                  <label
                    htmlFor={`rejection-${item._id}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Rejection Reason (required if rejecting)
                  </label>
                  <textarea
                    id={`rejection-${item._id}`}
                    value={rejectionReasons[item._id] || ""}
                    onChange={(e) =>
                      handleReasonChange(item._id, e.target.value)
                    }
                    placeholder="Provide a detailed reason for rejection..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows="3"
                  />
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => setupConfirmation("reject", item._id, kycType)}
                    className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center"
                    disabled={userUpdateLoading}
                  >
                    <X size={18} className="mr-1.5" /> Reject
                  </button>
                  {kycType === "driver" && (
                    <button
                      onClick={() => setupConfirmation("resubmit", item._id, kycType)}
                      className="px-4 py-2 bg-white border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors flex items-center"
                      disabled={userUpdateLoading}
                    >
                      <RefreshCw size={18} className="mr-1.5" /> Need Resubmission
                    </button>
                  )}
                  <button
                    onClick={() => setupConfirmation("approve", item._id, kycType)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    disabled={userUpdateLoading}
                  >
                    <Check size={18} className="mr-1.5" /> Approve
                  </button>
                </div>
              </div>
            )}

            {/* Card Footer with Actions (when collapsed) */}
            {expandedItem !== item._id && (
              <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setupConfirmation("reject", item._id, kycType)}
                  className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  disabled={userUpdateLoading}
                >
                  Reject
                </button>
                {kycType === "driver" && (
                  <button
                    onClick={() => setupConfirmation("resubmit", item._id, kycType)}
                    className="px-4 py-2 bg-white border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                    disabled={userUpdateLoading}
                  >
                    Need Resubmission
                  </button>
                )}
                <button
                  onClick={() => setupConfirmation("approve", item._id, kycType)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={userUpdateLoading}
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {confirmAction.action === "approve"
                  ? "Approve KYC"
                  : confirmAction.action === "resubmit"
                  ? "Request Resubmission"
                  : "Reject KYC"}
              </h2>
              <p className="text-gray-600 mb-6">
                {confirmAction.action === "approve"
                  ? "Are you sure you want to approve this KYC verification?"
                  : confirmAction.action === "resubmit"
                  ? "Are you sure you want to request resubmission of this KYC?"
                  : "Are you sure you want to reject this KYC verification?"}
              </p>

              {(confirmAction.action === "reject" || confirmAction.action === "resubmit") && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Reason:
                  </p>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                    {rejectionReasons[confirmAction.id]}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelConfirmation}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    confirmAction.action === "approve"
                      ? handleApprove(confirmAction.id, confirmAction.itemType)
                      : confirmAction.action === "resubmit"
                      ? handleNeedsResubmission(confirmAction.id)
                      : handleReject(confirmAction.id, confirmAction.itemType)
                  }
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    confirmAction.action === "approve"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : confirmAction.action === "resubmit"
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {userUpdateLoading ? (
                    <span className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </span>
                  ) : confirmAction.action === "approve" ? (
                    "Confirm Approval"
                  ) : confirmAction.action === "resubmit" ? (
                    "Confirm Resubmission Request"
                  ) : (
                    "Confirm Rejection"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <X size={20} className="text-gray-600" />
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

export default AdminKYCRequests;