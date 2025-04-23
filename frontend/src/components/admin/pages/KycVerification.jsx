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
  Search,
  AlertCircle,
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
  const [actionInProgress, setActionInProgress] = useState(false);

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
      setActionInProgress(false);
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
    if (action === "resubmit" && !rejectionReasons[id]?.trim()) {
      toast.error("Please provide a reason for resubmission");
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
    setActionInProgress(true);
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

      // Refresh the list after successful operation
      setTimeout(() => {
        if (itemType === "user") {
          dispatch(fetchPendingUserKYC());
        } else {
          dispatch(fetchAllDriverKYCsAction({ status: statusFilter }));
        }
        setActionInProgress(false);
      }, 1000);
    } catch (err) {
      setActionInProgress(false);
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

    setActionInProgress(true);
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

      // Refresh the list after successful operation
      setTimeout(() => {
        if (itemType === "user") {
          dispatch(fetchPendingUserKYC());
        } else {
          dispatch(fetchAllDriverKYCsAction({ status: statusFilter }));
        }
        setActionInProgress(false);
      }, 1000);
    } catch (err) {
      setActionInProgress(false);
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

    setActionInProgress(true);
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

      // Refresh the list after successful operation
      setTimeout(() => {
        dispatch(fetchAllDriverKYCsAction({ status: statusFilter }));
        setActionInProgress(false);
      }, 1000);
    } catch (err) {
      setActionInProgress(false);
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

    return items.filter((item) => {
      const fullName = item.fullName || (item.user && item.user.fullName) || "";
      const email = item.email || (item.user && item.user.email) || "";

      return (
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  };

  // Sort filtered items
  const getSortedItems = () => {
    const filteredItems = getFilteredItems();

    return [...filteredItems].sort((a, b) => {
      if (sortBy === "name") {
        const nameA = a.fullName || (a.user && a.user.fullName) || "";
        const nameB = b.fullName || (b.user && b.user.fullName) || "";
        return sortOrder === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
          : new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
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

  // Get name based on type
  const getItemName = (item) => {
    if (kycType === "driver") {
      return (
        item.fullName || (item.user && item.user.fullName) || "Unknown Driver"
      );
    }
    return item.fullName || "Unknown User";
  };

  // Get email based on type
  const getItemEmail = (item) => {
    if (kycType === "driver") {
      return item.email || (item.user && item.user.email) || "No email";
    }
    return item.email || "No email";
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

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-emerald-100 text-emerald-800";
      case "rejected":
        return "bg-rose-100 text-rose-800";
      case "needs_resubmission":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-sky-100 text-sky-800";
    }
  };

  return (
    <div className="space-y-8 bg-slate-50 p-6 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              KYC Verification Requests
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Review and manage user and driver verification documents
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 w-full md:w-64 bg-slate-50"
              />
              <button
                onClick={handleRefresh}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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

        {/* KYC Type Selector and Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-xl">
              <button
                onClick={() => setKycType("user")}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  kycType === "user"
                    ? "bg-white text-violet-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <User className="inline mr-2 h-4 w-4" /> User KYC
              </button>
              <button
                onClick={() => setKycType("driver")}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  kycType === "driver"
                    ? "bg-white text-violet-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Car className="inline mr-2 h-4 w-4" /> Driver KYC
              </button>
            </div>

            {kycType === "driver" && (
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50"
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
            <span className="text-sm text-slate-600">Sort by:</span>
            <button
              onClick={() => {
                setSortBy("name");
                setSortOrder(
                  sortBy === "name" && sortOrder === "asc" ? "desc" : "asc"
                );
              }}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                sortBy === "name"
                  ? "bg-violet-50 text-violet-600 font-medium"
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
                  ? "bg-violet-50 text-violet-600 font-medium"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Date {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-16 bg-white rounded-2xl shadow-lg border border-slate-100">
          <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <p className="text-slate-600 text-lg">Loading requests...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-100">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">
            No KYC Requests
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-lg">
            {searchTerm
              ? "No results match your search criteria."
              : `There are no ${
                  statusFilter || "pending"
                } ${kycType} KYC verification requests at the moment.`}
          </p>
        </div>
      )}

      {/* KYC Request Cards */}
      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item._id}
            className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 bg-white shadow-md hover:shadow-lg"
          >
            {/* Card Header */}
            <div className="p-6 flex flex-wrap items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-md">
                  {kycType === "user" ? (
                    <User className="w-6 h-6 text-white" />
                  ) : (
                    <Car className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    {getItemName(item)}
                  </h2>
                  <div className="flex items-center text-sm text-slate-500">
                    <Mail className="w-4 h-4 mr-1.5" />
                    {getItemEmail(item)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(
                    item.status
                  )}`}
                >
                  {item.status
                    ? item.status.charAt(0).toUpperCase() +
                      item.status.slice(1).replace("_", " ")
                    : "Pending"}
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
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* User/Driver Info */}
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-500 mb-5 uppercase tracking-wider">
                      {kycType === "user" ? "User" : "Driver"} Information
                    </h3>
                    <div className="space-y-5">
                      <div className="flex items-start">
                        <div className="bg-violet-100 p-2.5 rounded-lg mr-4 shadow-sm">
                          <User className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Full Name</p>
                          <p className="font-medium text-slate-900 mt-1">
                            {getItemName(item)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-violet-100 p-2.5 rounded-lg mr-4 shadow-sm">
                          <Mail className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">
                            Email Address
                          </p>
                          <p className="font-medium text-slate-900 mt-1">
                            {getItemEmail(item)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-violet-100 p-2.5 rounded-lg mr-4 shadow-sm">
                          <Calendar className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">
                            Submission Date
                          </p>
                          <p className="font-medium text-slate-900 mt-1">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>
                      {kycType === "driver" && item.licenseNumber && (
                        <div className="flex items-start">
                          <div className="bg-violet-100 p-2.5 rounded-lg mr-4 shadow-sm">
                            <CreditCard className="w-5 h-5 text-violet-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">
                              License Number
                            </p>
                            <p className="font-medium text-slate-900 mt-1">
                              {item.licenseNumber}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Preview */}
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
                    <h3 className="text-sm font-medium text-slate-500 mb-5 uppercase tracking-wider">
                      KYC Documents
                    </h3>
                    <div className="grid grid-cols-2 gap-5">
                      {kycType === "user" && (
                        <>
                          {item.citizenshipFront && (
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
                          {item.citizenshipBack && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300">
                              <div className="aspect-w-16 aspect-h-9 bg-slate-100 relative">
                                <img
                                  src={
                                    item.citizenshipBack || "/placeholder.svg"
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
                        </>
                      )}
                      {kycType === "driver" && (
                        <>
                          {/* Check both keys that might contain driver's license image */}
                          {(item.driverLicenseImage || item.frontPhoto) && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300">
                              <div className="aspect-w-16 aspect-h-9 bg-slate-100 relative">
                                <img
                                  src={
                                    item.driverLicenseImage ||
                                    item.frontPhoto ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg"
                                  }
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
                                      item.driverLicenseImage ||
                                        item.frontPhoto,
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
                          {/* Vehicle registration or back of license */}
                          {(item.vehicleRegistrationImage ||
                            item.backPhoto) && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300">
                              <div className="aspect-w-16 aspect-h-9 bg-slate-100 relative">
                                <img
                                  src={
                                    item.vehicleRegistrationImage ||
                                    item.backPhoto ||
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
                                      item.vehicleRegistrationImage ||
                                        item.backPhoto,
                                      item.vehicleRegistrationImage
                                        ? "Vehicle Registration"
                                        : "License Back"
                                    )
                                  }
                                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200"
                                >
                                  <Eye className="w-8 h-8 text-white opacity-0 hover:opacity-100 transform scale-75 hover:scale-100 transition-all duration-200" />
                                </button>
                              </div>
                              <div className="p-3 text-center bg-slate-50 border-t border-slate-100">
                                <p className="text-sm font-medium text-slate-700">
                                  {item.vehicleRegistrationImage
                                    ? "Vehicle Registration"
                                    : "License Back"}
                                </p>
                              </div>
                            </div>
                          )}
                          {/* Insurance document if available */}
                          {item.insuranceImage && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300">
                              <div className="aspect-w-16 aspect-h-9 bg-slate-100 relative">
                                <img
                                  src={
                                    item.insuranceImage || "/placeholder.svg"
                                  }
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
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rejection Reason Input */}
                <div className="mt-8">
                  <label
                    htmlFor={`rejection-${item._id}`}
                    className="block text-sm font-medium text-slate-700 mb-2"
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
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none bg-white shadow-sm"
                    rows="3"
                  />
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    onClick={() =>
                      setupConfirmation("reject", item._id, kycType)
                    }
                    className="px-5 py-2.5 bg-white border border-rose-300 text-rose-600 rounded-xl hover:bg-rose-50 transition-colors flex items-center shadow-sm"
                    disabled={actionInProgress}
                  >
                    <X size={18} className="mr-2" /> Reject
                  </button>
                  {kycType === "driver" && (
                    <button
                      onClick={() =>
                        setupConfirmation("resubmit", item._id, kycType)
                      }
                      className="px-5 py-2.5 bg-white border border-amber-300 text-amber-600 rounded-xl hover:bg-amber-50 transition-colors flex items-center shadow-sm"
                      disabled={actionInProgress}
                    >
                      <RefreshCw size={18} className="mr-2" /> Need Resubmission
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setupConfirmation("approve", item._id, kycType)
                    }
                    className="px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors flex items-center shadow-sm"
                    disabled={actionInProgress}
                  >
                    <Check size={18} className="mr-2" /> Approve
                  </button>
                </div>
              </div>
            )}

            {/* Card Footer with Actions (when collapsed) */}
            {expandedItem !== item._id && (
              <div className="p-5 border-t border-slate-100 flex justify-end gap-4">
                <button
                  onClick={() => setupConfirmation("reject", item._id, kycType)}
                  className="px-4 py-2 bg-white border border-rose-300 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shadow-sm"
                  disabled={actionInProgress}
                >
                  Reject
                </button>
                {kycType === "driver" && (
                  <button
                    onClick={() =>
                      setupConfirmation("resubmit", item._id, kycType)
                    }
                    className="px-4 py-2 bg-white border border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors shadow-sm"
                    disabled={actionInProgress}
                  >
                    Need Resubmission
                  </button>
                )}
                <button
                  onClick={() =>
                    setupConfirmation("approve", item._id, kycType)
                  }
                  className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
                  disabled={actionInProgress}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-fade-in-up">
            <div className="p-6">
              <div className="flex items-center mb-4">
                {confirmAction.action === "approve" ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                    <Check className="w-5 h-5 text-emerald-600" />
                  </div>
                ) : confirmAction.action === "resubmit" ? (
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                    <RefreshCw className="w-5 h-5 text-amber-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mr-3">
                    <X className="w-5 h-5 text-rose-600" />
                  </div>
                )}
                <h2 className="text-xl font-semibold text-slate-800">
                  {confirmAction.action === "approve"
                    ? "Approve KYC"
                    : confirmAction.action === "resubmit"
                    ? "Request Resubmission"
                    : "Reject KYC"}
                </h2>
              </div>
              <p className="text-slate-600 mb-6">
                {confirmAction.action === "approve"
                  ? "Are you sure you want to approve this KYC verification?"
                  : confirmAction.action === "resubmit"
                  ? "Are you sure you want to request resubmission of this KYC?"
                  : "Are you sure you want to reject this KYC verification?"}
              </p>

              {(confirmAction.action === "reject" ||
                confirmAction.action === "resubmit") && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Reason:
                  </p>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                    {rejectionReasons[confirmAction.id]}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelConfirmation}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
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
                  className={`px-5 py-2.5 text-white rounded-xl transition-colors font-medium ${
                    confirmAction.action === "approve"
                      ? "bg-violet-600 hover:bg-violet-700"
                      : confirmAction.action === "resubmit"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                  disabled={actionInProgress}
                >
                  {actionInProgress ? (
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm"
          onClick={closeImageModal}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-medium text-slate-800 text-lg">
                {viewImage.title}
              </h3>
              <button
                onClick={closeImageModal}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>
            <div className="p-6 flex items-center justify-center bg-slate-100 max-h-[70vh] overflow-auto">
              <img
                src={viewImage.url || "/placeholder.svg"}
                alt={viewImage.title}
                className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
              />
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={closeImageModal}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-violet-500"
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
