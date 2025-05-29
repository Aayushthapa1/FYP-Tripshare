import React, { useEffect, useRef } from "react";
import RatingForm from "./RatingForm";
import { X } from "lucide-react";
import { Toaster } from "sonner";
import { useNavigate } from "react-router-dom";

const RatingModal = ({
  isOpen,
  onClose,
  referenceType,
  referenceId,
  driverName,
  driverImage,
  driverId,
  categoryRatings,
  onRatingSubmit,
}) => {
  const modalRef = useRef(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Prevent scrolling of background content when modal is open
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  // Handle keydown events using React's event system
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleSuccessfulRating = () => {
    // Call the callback function if provided
    if (onRatingSubmit) {
      onRatingSubmit(true);
    }

    // Close the modal
    onClose();

    // If the reference type is a completed Ride, navigate to home
    if (referenceType === "Ride") {
      // Add a small delay to ensure modal closes properly
      const timer = setTimeout(() => {
        navigate("/");
      }, 500);

      // Clean up the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  };

  console.log("RatingModal rendering with props:", {
    referenceType,
    referenceId,
    driverName,
    driverImage,
    driverId,
  });

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      ref={modalRef}
    >

      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      ></div>

      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4 z-10">
            <button
              type="button"
              className="bg-white rounded-full p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onClose}
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <RatingForm
            referenceType={referenceType}
            referenceId={referenceId}
            driverName={driverName}
            driverImage={driverImage}
            driverId={driverId}
            isModal={true}
            onClose={onClose}
            onSuccess={handleSuccessfulRating}
           
            categoryRatings={categoryRatings}
          />
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
