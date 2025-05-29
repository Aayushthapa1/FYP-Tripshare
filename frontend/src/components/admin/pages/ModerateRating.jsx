import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  fetchDriverRatings,
  moderateRating,
  getRatingById,
  fetchDriverRatingSummary,
  clearActionSuccess,
} from "../../Slices/ratingSlice";
import {
  Star,
  Flag,
  Trash2,
  AlertCircle,
  Search,
  ChevronDown,
  Filter,
  Car,
  User,
  RefreshCw,
  CheckCircle,
  X,
  Clock,
  Shield,
} from "lucide-react";

const ModerateRatingsAdmin = () => {
  const dispatch = useDispatch();

  // Get data from Redux store
  const {
    driverRatings,
    driverSummary,
    loading,
    error,
    actionSuccess,
    lastAction,
    pagination,
  } = useSelector((state) => state.rating);

  // Local states
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRating, setExpandedRating] = useState(null);
  const [moderationAction, setModerationAction] = useState(null); // 'flag' or 'delete'
  const [moderationReason, setModerationReason] = useState("");
  const [selectedRatingId, setSelectedRatingId] = useState(null);
  const [filterType, setFilterType] = useState("all"); // 'all', 'Trip', 'Ride'
  const [sortBy, setSortBy] = useState("date"); // 'date' or 'rating'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [driverId, setDriverId] = useState(""); // For fetching specific driver ratings
  const [driverIdInput, setDriverIdInput] = useState("");
  const [showModerationModal, setShowModerationModal] = useState(false);

  // Fetch ratings handler (memoized to prevent re-creation on every render)
  const fetchRatings = useCallback(() => {
    if (driverId) {
      dispatch(
        fetchDriverRatings({
          driverId,
          page: currentPage,
          limit: 10,
          referenceType: filterType !== "all" ? filterType : undefined,
          sortBy,
          sortOrder,
        })
      );
    }
  }, [dispatch, driverId, currentPage, filterType, sortBy, sortOrder]);

  // Fetch ratings on mount or when filters change
  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  // Handle success/error notifications
  useEffect(() => {
    if (actionSuccess && lastAction) {
      toast.success("Rating moderated successfully");
      setShowModerationModal(false);
      setModerationReason("");
      setSelectedRatingId(null);
      dispatch(clearActionSuccess());

      // Refresh data
      fetchRatings();
    }

    if (error) {
      toast.error(error);
    }
  }, [actionSuccess, lastAction, error, dispatch, fetchRatings]);

  // Toggle expanded view for a rating
  const toggleExpand = (id) => {
    if (expandedRating === id) {
      setExpandedRating(null);
    } else {
      setExpandedRating(id);
      // If expanding, fetch detailed rating
      dispatch(getRatingById(id));
    }
  };

  // Open moderation modal
  const openModerationModal = (ratingId, action) => {
    setSelectedRatingId(ratingId);
    setModerationAction(action);
    setModerationReason("");
    setShowModerationModal(true);
  };

  // Close moderation modal
  const closeModerationModal = () => {
    setShowModerationModal(false);
    setSelectedRatingId(null);
    setModerationAction(null);
    setModerationReason("");
  };

  // Handle moderation submission
  const handleModerateRating = () => {
    if (!moderationReason.trim()) {
      toast.error("Please provide a reason for this action");
      return;
    }

    dispatch(
      moderateRating({
        ratingId: selectedRatingId,
        action: moderationAction,
        reason: moderationReason,
      })
    );
  };

  // Handle search for driver
  const handleDriverSearch = () => {
    if (driverIdInput.trim()) {
      const newDriverId = driverIdInput.trim();
      setDriverId(newDriverId);
      setCurrentPage(1);

      // Also fetch driver summary
      dispatch(fetchDriverRatingSummary(newDriverId));
    } else {
      toast.error("Please enter a driver ID");
    }
  };

  // Clear search
  const clearSearch = () => {
    setDriverId("");
    setDriverIdInput("");
  };

  // Rating stars display helper
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            fill={i < rating ? "#fbbf24" : "none"}
            stroke={i < rating ? "#fbbf24" : "#cbd5e1"}
            className="w-4 h-4"
          />
        ))}
      </div>
    );
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // For pagination
  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-6 bg-slate-50 p-4 md:p-6 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8 border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              Ratings Moderation
            </h1>
            <p className="text-slate-500 mt-2 text-base md:text-lg">
              Review and moderate user ratings for quality control
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Driver ID Search */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Enter Driver ID"
                value={driverIdInput}
                onChange={(e) => setDriverIdInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-slate-50"
              />
              <User className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            </div>
            <button
              onClick={handleDriverSearch}
              className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search Driver
            </button>
            {driverId && (
              <button
                onClick={clearSearch}
                className="px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </button>
            )}
          </div>

          {/* Filters */}
          {driverId && (
            <div className="flex flex-wrap gap-3 items-center">
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="flex items-center divide-x divide-slate-200">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-4 py-2 text-sm font-medium ${
                      filterType === "all"
                        ? "bg-green-50 text-green-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    All Ratings
                  </button>
                  <button
                    onClick={() => setFilterType("Trip")}
                    className={`px-4 py-2 text-sm font-medium ${
                      filterType === "Trip"
                        ? "bg-green-50 text-green-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Trip Ratings
                  </button>
                  <button
                    onClick={() => setFilterType("Ride")}
                    className={`px-4 py-2 text-sm font-medium ${
                      filterType === "Ride"
                        ? "bg-green-50 text-green-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Ride Ratings
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-slate-200 rounded-md p-2 text-sm bg-white"
                >
                  <option value="date">Date</option>
                  <option value="rating">Rating</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="p-2 border border-slate-200 rounded-md bg-white text-slate-700"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>

              <button
                onClick={fetchRatings}
                className="ml-auto px-3 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 flex items-center space-x-1"
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                <span>Refresh</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12 md:py-16 bg-white rounded-2xl shadow-lg border border-slate-100">
          <div className="w-8 h-8 border-3 border-green-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <p className="text-slate-600 text-lg">Loading ratings...</p>
        </div>
      )}

      {/* Driver info banner (shown when driver data is loaded) */}
      {driverId && driverSummary && !loading && (
        <div className="bg-white rounded-xl p-4 shadow-md border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-slate-800">
                {driverSummary.driverInfo?.name || "Driver"}
              </h3>
              <div className="flex items-center mt-1">
                <div className="flex">
                  {renderStars(driverSummary.driverInfo?.averageRating || 0)}
                </div>
                <span className="ml-2 text-slate-700">
                  {driverSummary.driverInfo?.averageRating?.toFixed(1) || "0.0"}
                  <span className="text-slate-500 text-sm ml-1">
                    ({driverSummary.driverInfo?.totalRatings || 0} ratings)
                  </span>
                </span>
              </div>
            </div>

            {/* Show some statistics if available */}
            {driverSummary.categoryAverages &&
              Object.keys(driverSummary.categoryAverages).length > 0 && (
                <div className="mt-3 md:mt-0 grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                  {Object.entries(driverSummary.categoryAverages).map(
                    ([category, score]) => (
                      <div
                        key={category}
                        className="bg-slate-50 p-2 rounded-lg"
                      >
                        <div className="text-xs text-slate-500 capitalize">
                          {category}
                        </div>
                        <div className="font-medium text-slate-800 mt-1">
                          {score.toFixed(1)}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
          </div>
        </div>
      )}

      {/* No Driver Selected State */}
      {!driverId && !loading && (
        <div className="text-center py-12 md:py-16 bg-white rounded-2xl shadow-lg border border-slate-100">
          <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800 mb-3">
            No Driver Selected
          </h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Please enter a driver ID to view and moderate their ratings.
          </p>
        </div>
      )}

      {/* Empty State */}
      {driverId &&
        !loading &&
        (!driverRatings || driverRatings.length === 0) && (
          <div className="text-center py-12 md:py-16 bg-white rounded-2xl shadow-lg border border-slate-100">
            <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-semibold text-slate-800 mb-3">
              No Ratings Found
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              {filterType !== "all"
                ? `This driver has no ${filterType.toLowerCase()} ratings yet.`
                : "This driver has no ratings yet."}
            </p>
          </div>
        )}

      {/* Ratings List */}
      {driverId && driverRatings && driverRatings.length > 0 && (
        <div className="space-y-4">
          {driverRatings.map((rating) => (
            <div
              key={rating._id}
              className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 bg-white shadow-md hover:shadow-lg"
            >
              {/* Rating Header */}
              <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                    {rating.referenceType === "Trip" ? (
                      <Car className="w-6 h-6 text-white" />
                    ) : (
                      <Car className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      {renderStars(rating.rating)}
                      <span className="ml-2 font-semibold text-slate-800">
                        {rating.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <User className="w-4 h-4 mr-1.5" />
                      {rating.userId?.fullName || "Unknown User"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                      rating.referenceType === "Trip"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {rating.referenceType}
                  </span>
                  <span className="text-sm text-slate-500 whitespace-nowrap">
                    <Clock className="inline-block w-3.5 h-3.5 mr-1" />
                    {formatDate(rating.createdAt)}
                  </span>
                  <button
                    onClick={() => toggleExpand(rating._id)}
                    className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors duration-200"
                    aria-label={
                      expandedRating === rating._id
                        ? "Collapse details"
                        : "Expand details"
                    }
                  >
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${
                        expandedRating === rating._id
                          ? "transform rotate-180"
                          : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedRating === rating._id && (
                <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50">
                  <div className="space-y-6">
                    {/* Review Text */}
                    {rating.review && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-medium text-slate-800 mb-2">
                          Review
                        </h3>
                        <p className="text-slate-600">{rating.review}</p>
                      </div>
                    )}

                    {/* Category Ratings */}
                    {rating.categoryRatings &&
                      Object.keys(rating.categoryRatings).length > 0 && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <h3 className="font-medium text-slate-800 mb-3">
                            Category Ratings
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {Object.entries(rating.categoryRatings).map(
                              ([category, value]) => (
                                <div key={category} className="flex flex-col">
                                  <span className="text-sm text-slate-500 capitalize">
                                    {category}
                                  </span>
                                  <div className="flex items-center mt-1">
                                    <div className="flex">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          fill={i < value ? "#fbbf24" : "none"}
                                          stroke={
                                            i < value ? "#fbbf24" : "#cbd5e1"
                                          }
                                          className="w-4 h-4"
                                        />
                                      ))}
                                    </div>
                                    <span className="ml-2 text-xs font-medium text-slate-700">
                                      {value.toFixed(1)}
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Reference Details */}
                    {rating.referenceDetails && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-medium text-slate-800 mb-3">
                          {rating.referenceType} Details
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {rating.referenceType === "Trip" && (
                            <>
                              <div>
                                <span className="text-sm text-slate-500">
                                  From
                                </span>
                                <p className="font-medium text-slate-800">
                                  {rating.referenceDetails.departureLocation ||
                                    "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm text-slate-500">
                                  To
                                </span>
                                <p className="font-medium text-slate-800">
                                  {rating.referenceDetails
                                    .destinationLocation || "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm text-slate-500">
                                  Date
                                </span>
                                <p className="font-medium text-slate-800">
                                  {rating.referenceDetails.departureDate
                                    ? formatDate(
                                        rating.referenceDetails.departureDate
                                      )
                                    : "N/A"}
                                </p>
                              </div>
                            </>
                          )}

                          {rating.referenceType === "Ride" && (
                            <>
                              <div>
                                <span className="text-sm text-slate-500">
                                  From
                                </span>
                                <p className="font-medium text-slate-800">
                                  {rating.referenceDetails.pickupLocationName ||
                                    "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm text-slate-500">
                                  To
                                </span>
                                <p className="font-medium text-slate-800">
                                  {rating.referenceDetails
                                    .dropoffLocationName || "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm text-slate-500">
                                  Distance
                                </span>
                                <p className="font-medium text-slate-800">
                                  {rating.referenceDetails.distance
                                    ? `${rating.referenceDetails.distance.toFixed(
                                        1
                                      )} km`
                                    : "N/A"}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm text-slate-500">
                                  Fare
                                </span>
                                <p className="font-medium text-slate-800">
                                  {rating.referenceDetails.fare
                                    ? `$${rating.referenceDetails.fare.toFixed(
                                        2
                                      )}`
                                    : "N/A"}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Moderation Actions */}
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={() => openModerationModal(rating._id, "flag")}
                        className="px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors flex items-center"
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Flag Content
                      </button>
                      <button
                        onClick={() =>
                          openModerationModal(rating._id, "delete")
                        }
                        className="px-4 py-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Rating
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {driverId && driverRatings && driverRatings.length > 0 && pagination && (
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium">
              {pagination.total === 0
                ? 0
                : (pagination.currentPage - 1) * 10 + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(pagination.currentPage * 10, pagination.total)}
            </span>{" "}
            of <span className="font-medium">{pagination.total}</span> ratings
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={pagination.currentPage <= 1}
              className={`px-3 py-2 rounded-md border ${
                pagination.currentPage <= 1
                  ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={pagination.currentPage >= pagination.totalPages}
              className={`px-3 py-2 rounded-md border ${
                pagination.currentPage >= pagination.totalPages
                  ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Moderation Modal */}
      {showModerationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in-up">
            <div className="p-6">
              <div className="flex items-center mb-4">
                {moderationAction === "flag" ? (
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                    <Flag className="w-5 h-5 text-amber-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mr-3">
                    <Trash2 className="w-5 h-5 text-rose-600" />
                  </div>
                )}
                <h2 className="text-xl font-semibold text-slate-800">
                  {moderationAction === "flag"
                    ? "Flag Rating"
                    : "Delete Rating"}
                </h2>
              </div>

              <p className="text-slate-600 mb-4">
                {moderationAction === "flag"
                  ? "Flag this rating for further review. The rating will be marked as flagged but remain visible."
                  : "Delete this rating from the platform. This action cannot be undone."}
              </p>

              <div className="mb-4">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Reason (
                  {moderationAction === "flag" ? "Required" : "Required"})
                </label>
                <textarea
                  id="reason"
                  rows="3"
                  placeholder={`Please provide a reason for ${
                    moderationAction === "flag" ? "flagging" : "deleting"
                  } this rating...`}
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModerationModal}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModerateRating}
                  disabled={loading}
                  className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center ${
                    moderationAction === "flag"
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : moderationAction === "flag" ? (
                    "Confirm Flag"
                  ) : (
                    "Confirm Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerateRatingsAdmin;
