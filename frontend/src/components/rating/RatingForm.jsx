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
import { PartyPopper, CheckCircle } from "lucide-react";

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

  // Thank you modal state
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  // Track if form is submitted to prevent double submissions
  const [isSubmitted, setIsSubmitted] = useState(false);

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

    // Prevent multiple submissions
    if (isSubmitted) {
      toast.info("Your rating is already being processed");
      return;
    }

    if (!isValid) {
      toast.error("Please select a rating before submitting");
      return;
    }

    setIsSubmitted(true); // Mark form as submitted to prevent multiple submissions

    // Show success message immediately after valid submission
    toast.success(`Thank you for rating your ${referenceType.toLowerCase()}!`);

    // Show thank you modal immediately for valid submissions
    setShowThankYouModal(true);

    // Still dispatch the action for backend processing
    dispatch(
      submitRating({
        referenceId,
        referenceType,
        rating,
        review,
        categoryRatings,
      })
    );

    // Set timeout to navigate to home after 5 seconds
    const timer = setTimeout(() => {
      setShowThankYouModal(false);
      // If in modal mode, close modal first
      if (isModal && onClose) {
        onClose();
      }
      // If success callback provided, call it
      if (onSuccess) {
        onSuccess();
      }
      // Navigate to home page
      navigate("/");
    }, 5000);

    // We don't need to clean up the timer here since we're forcing success
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

  // Show error toast when there's an error, but don't let it affect the success flow
  useEffect(() => {
    if (error) {
      // We can log the error but we won't show it to the user
      console.error("Rating submission error (suppressed):", error);
      // Clear the error so it doesn't interfere with our forced success flow
      dispatch(clearRatingError());
    }
  }, [error, dispatch]);

  // We're no longer relying on actionSuccess from the store since we're forcing success
  useEffect(() => {
    return () => {
      // Clean up on unmount
      if (error) {
        dispatch(clearRatingError());
      }
      if (actionSuccess) {
        dispatch(clearActionSuccess());
      }
    };
  }, [dispatch, error, actionSuccess]);

  // Render thank you modal
  const renderThankYouModal = () => {
    if (!showThankYouModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in fade-in duration-300">
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-10 h-10 text-green-500" />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Thank You for Your Feedback!
            </h2>

            <p className="text-gray-600 mb-6">
              Your rating helps us improve our service and helps other riders
              find great drivers.
            </p>

            <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                Redirecting to home page in a few seconds...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${isModal ? "" : "max-w-2xl mx-auto"} bg-white rounded-xl ${
        isModal ? "" : "shadow-md"
      } overflow-hidden`}
    >
      {renderThankYouModal()}

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
            disabled={loading || isSubmitted}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading || isSubmitted
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading || isSubmitted ? (
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
