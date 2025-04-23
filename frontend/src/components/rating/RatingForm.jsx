import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  submitRating,
  clearActionSuccess,
  clearRatingError,
} from "../Slices/ratingSlice";
import { toast } from "sonner";
import StarRating from "./StarRating.jsx";

const RatingForm = ({
  referenceType,
  referenceId,
  driverName,
  driverImage,
  isModal = false, // Flag to indicate if rendered in a modal
  onClose = null, // Function to close the modal
  onSuccess = null, // Callback for successful submission
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, actionSuccess } = useSelector(
    (state) => state.rating
  );

  // Form state
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [categoryRatings, setCategoryRatings] = useState({
    punctuality: 0,
    cleanliness: 0,
    comfort: 0,
    drivingSkill: 0,
    communication: 0,
  });

  // Form validation state
  const [touched, setTouched] = useState(false);
  const isValid = rating > 0;

  // Handle category rating change
  const handleCategoryChange = (category, value) => {
    setCategoryRatings({
      ...categoryRatings,
      [category]: value,
    });
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);

    if (!isValid) {
      toast.error("Please select a rating before submitting");
      return;
    }

    dispatch(
      submitRating({
        referenceId,
        referenceType,
        rating,
        review,
        categoryRatings,
      })
    );
  };

  // Skip rating handler - enhanced to handle modal
  const handleSkip = () => {
    if (isModal && onClose) {
      // Just close the modal if in modal mode
      toast.info("You can rate your ride later");
      onClose();
    } else {
      // Navigate if not in modal
      if (referenceType === "Trip") {
        navigate("/my-trips");
      } else {
        navigate("/my-rides");
      }
    }
  };

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle successful submission - enhanced for modal
  useEffect(() => {
    if (actionSuccess) {
      // Show success message
      toast.success(
        `Thank you for rating your ${referenceType.toLowerCase()}!`
      );

      // Reset form
      setRating(0);
      setReview("");
      setCategoryRatings({
        punctuality: 0,
        cleanliness: 0,
        comfort: 0,
        drivingSkill: 0,
        communication: 0,
      });

      // Clear success flag
      dispatch(clearActionSuccess());

      // If success callback provided, call it
      if (onSuccess) {
        onSuccess();
      }
      // If in modal, just close it
      else if (isModal && onClose) {
        onClose();
      }
      // Otherwise navigate based on reference type
      else {
        if (referenceType === "Trip") {
          navigate("/my-trips");
        } else {
          navigate("/my-rides");
        }
      }
    }

    // Clean up error on unmount
    return () => {
      if (error) {
        dispatch(clearRatingError());
      }
    };
  }, [
    actionSuccess,
    dispatch,
    navigate,
    referenceType,
    error,
    isModal,
    onClose,
    onSuccess,
  ]);

  return (
    <div
      className={`${isModal ? "" : "max-w-2xl mx-auto"} bg-white rounded-xl ${
        isModal ? "" : "shadow-md"
      } overflow-hidden`}
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Rate your {referenceType === "Trip" ? "Trip" : "Ride"}
          </h2>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {referenceType} Completed
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          {driverImage ? (
            <img
              src={driverImage}
              alt={driverName || "Driver"}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-xl">
                {driverName ? driverName.charAt(0) : "D"}
              </span>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {driverName || "Your Driver"}
            </h3>
            <p className="text-sm text-gray-500">
              {referenceType === "Trip" ? "Trip Driver" : "Ride Driver"}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How would you rate your overall experience?
          </label>
          <StarRating
            rating={rating}
            setRating={setRating}
            size="lg"
            color="amber"
            showLabel={true}
            className="mb-1"
          />
          {touched && !isValid && (
            <p className="mt-1 text-sm text-red-600">Please select a rating</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate specific aspects
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Punctuality</span>
                <StarRating
                  rating={categoryRatings.punctuality}
                  setRating={(value) =>
                    handleCategoryChange("punctuality", value)
                  }
                  size="sm"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cleanliness</span>
                <StarRating
                  rating={categoryRatings.cleanliness}
                  setRating={(value) =>
                    handleCategoryChange("cleanliness", value)
                  }
                  size="sm"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Comfort</span>
                <StarRating
                  rating={categoryRatings.comfort}
                  setRating={(value) => handleCategoryChange("comfort", value)}
                  size="sm"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Driving Skill</span>
                <StarRating
                  rating={categoryRatings.drivingSkill}
                  setRating={(value) =>
                    handleCategoryChange("drivingSkill", value)
                  }
                  size="sm"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Communication</span>
                <StarRating
                  rating={categoryRatings.communication}
                  setRating={(value) =>
                    handleCategoryChange("communication", value)
                  }
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="review"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Write a review (optional)
          </label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with the driver..."
            rows={4}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isModal ? "Later" : "Skip"}
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </>
            ) : (
              "Submit Rating"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RatingForm;
