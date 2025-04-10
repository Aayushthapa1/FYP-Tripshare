import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Star, X, Send, ThumbsUp } from 'lucide-react';

const RatingModal = ({ isOpen, onClose, bookingId, tripDetails }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get user and driver details from Redux store
  const userData = useSelector((state) => state.user?.userData?.Result?.user_data);
  const driverData = useSelector((state) => state.driver?.driverData);

  const dispatch = useDispatch();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoveredRating(0);
      setFeedback("");
      setIsSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleRatingHover = (hoveredValue) => {
    setHoveredRating(hoveredValue);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);

    try {
      // In a real app, you would dispatch an action to submit the rating
      // dispatch(submitRating({ bookingId, rating, feedback }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success state
      setIsSubmitted(true);
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          className="relative bg-white rounded-xl shadow-xl max-w-md w-full animate-fade-in dark:bg-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 text-gray-700 hover:bg-gray-200 transition-colors dark:bg-gray-700/80 dark:text-gray-300 dark:hover:bg-gray-600"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {!isSubmitted ? (
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-green-900/30">
                  <Star className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Rate Your Ride</h2>
                <p className="text-gray-600 mt-1 dark:text-gray-400">
                  How was your experience with {driverData?.fullName || tripDetails?.driverName || "your driver"}?
                </p>
              </div>

              {/* Driver info */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white font-bold mr-3">
                    {driverData?.fullName
                      ? driverData.fullName
                          .split(" ")
                          .map((name) => name[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "D"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {driverData?.fullName || tripDetails?.driverName || "Driver"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tripDetails?.from} to {tripDetails?.to}
                    </p>
                  </div>
                </div>
              </div>

              {/* Star rating */}
              <div className="flex justify-center mb-6">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      onMouseEnter={() => handleRatingHover(star)}
                      onMouseLeave={() => handleRatingHover(0)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback textarea */}
              <div className="mb-6">
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Additional feedback (optional)
                </label>
                <textarea
                  id="feedback"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Tell us about your experience..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                ></textarea>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className={`w-full py-3 rounded-md flex items-center justify-center ${
                  rating === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Submit Rating
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-green-900/30">
                <ThumbsUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 dark:text-white">Thank You!</h2>
              <p className="text-gray-600 dark:text-gray-400">Your feedback has been submitted successfully.</p>
              <div className="flex justify-center mt-4">
                <div className="flex">
                  {[...Array(rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
