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

const MyRatings = () => {
  const dispatch = useDispatch();
  const { driverRatings, driverSummary, loading, error, pagination } =
    useSelector((state) => state.rating);
  const { currentUser } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("all"); // 'all', 'positive', 'negative'

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser?._id) {
        try {
          console.log("Fetching driver summary for ID:", currentUser._id);
          await dispatch(fetchDriverRatingSummary(currentUser._id));
          await loadRatings(1);
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      }
    };

    fetchData();
  }, [dispatch, currentUser]);

  const loadRatings = async (page, limit = 5) => {
    if (currentUser?._id) {
      try {
        console.log("Loading ratings for user ID:", currentUser._id);
        await dispatch(
          fetchDriverRatings({ driverId: currentUser._id, page, limit })
        );
        setCurrentPage(page);
      } catch (err) {
        console.error("Error loading ratings:", err);
      }
    }
  };

  console.log("Driver ratings:", driverRatings);
  console.log("Driver summary:", driverSummary);
  console.log("Loading state:", loading);
  console.log("Error state:", error);
  console.log("Pagination:", pagination);

  const handlePageChange = (newPage) => {
    loadRatings(newPage);
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (mode) => {
    setViewMode(mode);
    // Note: In a real implementation, you might want to filter on the server side
    // by passing filter parameters to the fetchDriverRatings action
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
        return { label: "Punctuality", icon: "⏱️" };
      case "cleanliness":
        return { label: "Cleanliness", icon: "✨" };
      case "comfort":
        return { label: "Comfort", icon: "🛋️" };
      case "drivingSkill":
        return { label: "Driving Skill", icon: "🚗" };
      case "communication":
        return { label: "Communication", icon: "💬" };
      default:
        return { label: category, icon: "⭐" };
    }
  };

  if (loading && !driverRatings.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader">Loading...</div>
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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Ratings & Reviews</h1>

      {/* Rating Summary Section */}
      {driverSummary && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Rating Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Rating */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 mb-2">
                <CircularProgressbar
                  value={(driverSummary.averageRating / 5) * 100}
                  text={`${driverSummary.averageRating.toFixed(1)}`}
                  styles={buildStyles({
                    textSize: "28px",
                    pathColor: "#4f46e5",
                    textColor: "#1f2937",
                    trailColor: "#e5e7eb",
                  })}
                />
              </div>
              <p className="text-center text-gray-700">
                Overall Rating
                <br />
                <span className="text-sm text-gray-500">
                  ({driverSummary.totalRatings}{" "}
                  {driverSummary.totalRatings === 1 ? "rating" : "ratings"})
                </span>
              </p>
            </div>

            {/* Category Breakdown */}
            <div className="col-span-2">
              <h3 className="text-lg font-medium mb-3">Category Ratings</h3>
              <div className="space-y-2">
                {driverSummary.categoryAverages &&
                  Object.entries(driverSummary.categoryAverages).map(
                    ([category, value]) => {
                      const { label, icon } = getCategoryInfo(category);
                      return (
                        <div key={category} className="flex items-center">
                          <span className="mr-2">{icon}</span>
                          <span className="w-32 text-sm">{label}</span>
                          <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${(value / 5) * 100}%` }}
                            />
                          </div>
                          <span className="ml-2 text-sm font-medium">
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

      {/* Filter Options */}
      <div className="flex mb-4 gap-2">
        <button
          onClick={() => handleFilterChange("all")}
          className={`px-4 py-2 rounded ${
            viewMode === "all" ? "bg-indigo-600 text-white" : "bg-gray-200"
          }`}
        >
          All Reviews
        </button>
        <button
          onClick={() => handleFilterChange("positive")}
          className={`px-4 py-2 rounded ${
            viewMode === "positive" ? "bg-indigo-600 text-white" : "bg-gray-200"
          }`}
        >
          Positive (4-5★)
        </button>
        <button
          onClick={() => handleFilterChange("negative")}
          className={`px-4 py-2 rounded ${
            viewMode === "negative" ? "bg-indigo-600 text-white" : "bg-gray-200"
          }`}
        >
          Needs Improvement (1-2★)
        </button>
      </div>

      {/* Ratings List */}
      <div className="space-y-4">
        {filteredRatings.length > 0 ? (
          filteredRatings.map((rating) => (
            <div
              key={rating._id}
              className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-500"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center">
                    {renderStars(rating.rating)}
                    <span className="ml-2 text-lg font-semibold">
                      {rating.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {rating.referenceType} •{" "}
                    {format(new Date(rating.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>

              {rating.review && (
                <div className="my-3">
                  <p className="text-gray-700">{rating.review}</p>
                </div>
              )}

              {/* Category Ratings */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                {rating.categoryRatings &&
                  Object.entries(rating.categoryRatings).map(
                    ([category, value]) => {
                      const { label, icon } = getCategoryInfo(category);
                      return (
                        <div key={category} className="flex items-center">
                          <span className="mr-1">{icon}</span>
                          <span className="text-sm text-gray-600">
                            {label}:{" "}
                          </span>
                          <span className="ml-1 font-medium">{value}</span>
                        </div>
                      );
                    }
                  )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">
              No ratings found matching your filter.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            {[...Array(pagination.totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`w-8 h-8 rounded-full ${
                  currentPage === index + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className={`px-3 py-1 rounded ${
                currentPage === pagination.totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default MyRatings;
