import React, { memo } from "react";
import {
  MapPin,
  Navigation,
  DollarSign,
  XCircle,
  Loader,
  Clock,
  Car,
  Bike,
} from "lucide-react";

/**
 * Enhanced ride notification component with improved features
 * - Better accessibility
 * - Improved error handling
 * - Better visual feedback
 */
const RideNotification = memo(
  ({ request, onAccept, onDecline, isAccepting }) => {
    // Safe accessors for request data with fallbacks
    const getPickupLocation = () => {
      try {
        return (
          request.pickupLocationName ||
          request.pickupLocation?.address ||
          "Pickup location"
        );
      } catch (e) {
        return "Pickup location";
      }
    };

    const getDropoffLocation = () => {
      try {
        return (
          request.dropoffLocationName ||
          request.dropoffLocation?.address ||
          "Dropoff location"
        );
      } catch (e) {
        return "Dropoff location";
      }
    };

    const getFare = () => {
      try {
        return request.fare || "0";
      } catch (e) {
        return "0";
      }
    };

    const getDistance = () => {
      try {
        return request.distance ? request.distance.toFixed(1) : null;
      } catch (e) {
        return null;
      }
    };

    const getVehicleType = () => {
      try {
        return request.vehicleType || "Car";
      } catch (e) {
        return "Car";
      }
    };

    const getRequestTime = () => {
      try {
        if (request.createdAt) {
          return new Date(request.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        }
        return null;
      } catch (e) {
        return null;
      }
    };

    // Handler with error prevention
    const handleAccept = () => {
      try {
        if (isAccepting || !onAccept) return;
        onAccept(request);
      } catch (error) {
        console.error("Error accepting ride:", error);
      }
    };

    // Handler with error prevention
    const handleDecline = () => {
      try {
        if (!onDecline) return;
        onDecline();
      } catch (error) {
        console.error("Error declining ride:", error);
      }
    };

    // Get the vehicle icon based on type
    const VehicleIcon = getVehicleType().toLowerCase() === "bike" ? Bike : Car;

    return (
      <div
        role="alert"
        aria-live="polite"
        className="bg-white rounded-lg shadow-lg p-4 max-w-sm border-l-4 border-blue-500 animate-in slide-in-from-right"
      >
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-800 flex items-center text-sm">
            <MapPin className="w-4 h-4 mr-1 text-blue-500" />
            New Ride Request
          </h4>
          {getRequestTime() && (
            <div className="flex items-center text-xs text-gray-500 mr-2">
              <Clock className="w-3 h-3 mr-1" />
              {getRequestTime()}
            </div>
          )}
          <button
            onClick={handleDecline}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full"
            aria-label="Decline ride"
            title="Decline ride"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-2 text-sm space-y-2">
          {/* Vehicle type indicator */}
          <div className="flex items-center mb-1 bg-gray-50 px-2 py-1 rounded-md inline-block">
            <VehicleIcon className="w-3 h-3 text-gray-600 mr-1 flex-shrink-0" />
            <span className="text-gray-700 font-medium">
              {getVehicleType()}
            </span>
          </div>

          {/* Pickup location */}
          <div className="flex items-start mb-1">
            <MapPin className="w-3.5 h-3.5 text-green-500 mr-1.5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs text-gray-500 block">From</span>
              <span className="text-gray-700 font-medium block truncate max-w-[250px]">
                {getPickupLocation()}
              </span>
            </div>
          </div>

          {/* Dropoff location */}
          <div className="flex items-start mb-1">
            <Navigation className="w-3.5 h-3.5 text-red-500 mr-1.5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs text-gray-500 block">To</span>
              <span className="text-gray-700 font-medium block truncate max-w-[250px]">
                {getDropoffLocation()}
              </span>
            </div>
          </div>

          {/* Fare and distance */}
          <div className="flex items-center mb-1 bg-green-50 px-3 py-1.5 rounded-lg">
            <DollarSign className="w-4 h-4 text-green-600 mr-1.5 flex-shrink-0" />
            <div>
              <span className="text-gray-700 font-medium">NPR {getFare()}</span>
              {getDistance() && (
                <span className="text-xs text-gray-500 ml-1.5">
                  ({getDistance()} km)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {/* Accept button */}
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            aria-busy={isAccepting ? "true" : "false"}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-sm ${
              isAccepting
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            }`}
          >
            {isAccepting ? (
              <div className="flex items-center justify-center">
                <Loader className="w-3.5 h-3.5 mr-2 animate-spin" />
                Accepting...
              </div>
            ) : (
              "Accept Ride"
            )}
          </button>

          {/* Decline button */}
          <button
            onClick={handleDecline}
            disabled={isAccepting}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-sm
            ${
              isAccepting
                ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                : "text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:outline-none"
            }`}
          >
            Decline
          </button>
        </div>
      </div>
    );
  }
);

// Set display name for debugging
RideNotification.displayName = "RideNotification";

export default RideNotification;
