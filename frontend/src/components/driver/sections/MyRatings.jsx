import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDriverRatings,
  fetchDriverRatingSummary,
} from "../../Slices/ratingSlice";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { format } from "date-fns";
import {
  Filter,
  Calendar,
  MapPin,
  Star,
  ChevronRight,
  ChevronLeft,
  Clock,
  MessageSquare,
} from "lucide-react";

const MyRatings = () => {
  const dispatch = useDispatch();
  const { driverRatings, driverSummary, loading, error, pagination } =
    useSelector((state) => state.rating);
  const { user } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("all"); // 'all', 'positive', 'negative'

  useEffect(() => {
    const fetchData = async () => {
      if (user?._id) {
        try {
          await dispatch(fetchDriverRatingSummary(user._id)).unwrap();
          await loadRatings(1);
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      }
    };

    fetchData();
  }, [dispatch, user]);

  const loadRatings = async (page, limit = 10) => {
    if (user?._id) {
      try {
        await dispatch(
          fetchDriverRatings({ driverId: user._id, page, limit })
        ).unwrap();
        setCurrentPage(page);
      } catch (err) {
        console.error("Error loading ratings:", err);
      }
    }
  };

  const handlePageChange = (newPage) => {
    loadRatings(newPage);
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (mode) => {
    setViewMode(mode);
  };

  // Filter ratings based on viewMode
  const filteredRatings = driverRatings.filter((rating) => {
    if (viewMode === "all") return true;
    if (viewMode === "positive") return rating.rating >= 4;
    if (viewMode === "negative") return rating.rating <= 2;
    return true;
  });

  // Function to render stars based on rating value
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-500" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-500" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-500" />);
      }
    }
    return <div className="flex">{stars}</div>;
  };

  // Function to get category label and icon
  const getCategoryInfo = (category) => {
    switch (category) {
      case "punctuality":
        return {
          label: "Punctuality",
          icon: <Clock className="h-4 w-4 text-blue-500" />,
        };
      case "cleanliness":
        return {
          label: "Cleanliness",
          icon: <Star className="h-4 w-4 text-emerald-500" />,
        };
      case "comfort":
        return {
          label: "Comfort",
          icon: <Star className="h-4 w-4 text-purple-500" />,
        };
      case "drivingSkill":
        return {
          label: "Driving Skill",
          icon: <Star className="h-4 w-4 text-amber-500" />,
        };
      case "communication":
        return {
          label: "Communication",
          icon: <MessageSquare className="h-4 w-4 text-indigo-500" />,
        };
      default:
        return {
          label: category,
          icon: <Star className="h-4 w-4 text-gray-500" />,
        };
    }
  };

  if (loading && !driverRatings.length) {
    return (
      <div className="flex justify-center items-center h-full p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        Error loading ratings: {error}
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 shadow-md text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">My Ratings & Reviews</h1>
            <p className="text-green-50">
              View and manage your passenger feedback and performance metrics
            </p>
          </div>
        </div>
      </div>

      {/* Rating Summary Section */}
      {driverSummary && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-white flex items-center">
            <Star className="h-5 w-5 mr-2 text-yellow-500" />
            Rating Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Rating */}
            <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6">
              <div className="w-28 h-28 mb-4">
                <CircularProgressbar
                  value={
                    ((driverSummary?.driverInfo?.averageRating || 0) / 5) * 100
                  }
                  text={`${(
                    driverSummary?.driverInfo?.averageRating || 0
                  ).toFixed(1)}`}
                  styles={buildStyles({
                    textSize: "28px",
                    pathColor: "#16a34a",
                    textColor: "#000000",
                    trailColor: "#e5e7eb",
                  })}
                />
              </div>
              <p className="text-center text-slate-700 dark:text-slate-200 font-medium">
                Overall Rating
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {driverSummary?.driverInfo?.totalRatings || 0}{" "}
                {driverSummary?.driverInfo?.totalRatings === 1
                  ? "rating"
                  : "ratings"}
              </p>
            </div>

            {/* Category Breakdown */}
            <div className="col-span-2 bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6">
              <h3 className="text-lg font-medium mb-4 text-slate-700 dark:text-slate-200">
                Category Ratings
              </h3>
              <div className="space-y-4">
                {driverSummary?.categoryAverages &&
                  Object.entries(driverSummary.categoryAverages).map(
                    ([category, value]) => {
                      const { label, icon } = getCategoryInfo(category);
                      return (
                        <div key={category} className="flex items-center">
                          <div className="flex items-center w-36">
                            <div className="mr-2">{icon}</div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {label}
                            </span>
                          </div>
                          <div className="flex-grow h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(value / 5) * 100}%` }}
                            />
                          </div>
                          <span className="ml-3 text-sm font-semibold w-8 text-right text-slate-700 dark:text-slate-300">
                            {value.toFixed(1)}
                          </span>
                        </div>
                      );
                    }
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ratings Table Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2 dark:bg-green-900/30">
              <Filter className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Passenger Reviews
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                All feedback from your riders
              </p>
            </div>
          </div>

          {/* Filter Options */}
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange("all")}
              className={`px-4 py-2 rounded-lg ${
                viewMode === "all"
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              } transition-colors`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange("positive")}
              className={`px-4 py-2 rounded-lg ${
                viewMode === "positive"
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              } transition-colors`}
            >
              4-5★
            </button>
            <button
              onClick={() => handleFilterChange("negative")}
              className={`px-4 py-2 rounded-lg ${
                viewMode === "negative"
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              } transition-colors`}
            >
              1-2★
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          {filteredRatings && filteredRatings.length > 0 ? (
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Trip Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Comments
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredRatings.map((rating) => (
                  <tr
                    key={rating._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderStars(rating.rating)}
                        <span className="ml-2 font-semibold text-slate-700 dark:text-slate-300">
                          {rating.rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                        {rating.categoryRatings &&
                          Object.entries(rating.categoryRatings).map(
                            ([category, value]) => {
                              const { label, icon } = getCategoryInfo(category);
                              return (
                                <div
                                  key={category}
                                  className="flex items-center"
                                >
                                  <div className="mr-1">{icon}</div>
                                  <span className="text-xs text-slate-600 dark:text-slate-400">
                                    {label}:{" "}
                                  </span>
                                  <span className="ml-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                                    {value}
                                  </span>
                                </div>
                              );
                            }
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {rating.userId?.fullName || "Anonymous"}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {rating.referenceType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700 dark:text-slate-300 flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                        {format(new Date(rating.createdAt), "MMM d, yyyy")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {rating.referenceDetails && (
                        <div className="text-sm text-slate-700 dark:text-slate-300 flex items-start">
                          <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-slate-400" />
                          <span>
                            {rating.referenceType === "Trip" ? (
                              <>
                                {rating.referenceDetails.departureLocation} to{" "}
                                {rating.referenceDetails.destinationLocation}
                              </>
                            ) : (
                              <>
                                {rating.referenceDetails.pickupLocationName} to{" "}
                                {rating.referenceDetails.dropoffLocationName}
                              </>
                            )}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {rating.review ? (
                        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                          {rating.review}
                        </p>
                      ) : (
                        <p className="text-sm italic text-slate-500 dark:text-slate-400">
                          No comments provided
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              {loading ? (
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mb-4"></div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 dark:bg-slate-700">
                    <Star className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  </div>
                </>
              )}
              <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">
                {loading ? "Loading your ratings..." : "No ratings found"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                {loading
                  ? "Please wait while we fetch your ratings data."
                  : "No ratings found matching your filter. As you receive ratings from passengers, they will appear here."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center p-6 border-t border-slate-200 dark:border-slate-700">
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {[...Array(pagination.totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`w-10 h-10 rounded-lg ${
                    currentPage === index + 1
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className={`p-2 rounded-lg ${
                  currentPage === pagination.totalPages
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRatings;
