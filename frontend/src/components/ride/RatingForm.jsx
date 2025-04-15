// components/RatingForm.jsx

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createRating } from "../Slices/ratingSlice";
import { Loader } from "lucide-react";

const RatingForm = ({ rideId, onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.rating);

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!rating || rating < 1 || rating > 5) {
      alert("Please provide a valid rating from 1 to 5.");
      return;
    }

    try {
      await dispatch(createRating({ rideId, rating, feedback })).unwrap();
      alert("Thank you! Your rating has been submitted.");
      if (onClose) onClose();
    } catch (error) {
      alert("Error submitting rating: " + error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border max-w-md w-full mx-auto">
      <h2 className="text-lg font-medium mb-3">Rate Your Ride</h2>

      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Rating (1-5):
        </label>
        <input
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value))}
          className="border border-gray-300 rounded px-3 py-2 mb-3 w-full"
          required
        />

        {/* Feedback */}
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Feedback (optional):
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write any comments or suggestions..."
          rows={3}
          className="border border-gray-300 rounded px-3 py-2 mb-3 w-full"
        ></textarea>

        <button
          type="submit"
          className={`w-full py-2 rounded font-medium text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } flex items-center justify-center`}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Rating"
          )}
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-3 py-2 rounded font-medium text-gray-600 bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
};

export default RatingForm;
