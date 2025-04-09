import React from "react";
import {
  MapPin,
  Navigation,
  DollarSign,
  XCircle,
  Loader
} from "lucide-react";

// Create a separate component for incoming ride notifications
const RideNotification = ({ 
  request, 
  onAccept, 
  onDecline, 
  isAccepting 
}) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-lg p-4 max-w-sm border-l-4 border-blue-500 animate-in slide-in-from-right"
    >
      <div className="flex justify-between">
        <h4 className="font-medium text-gray-800 flex items-center text-sm">
          <MapPin className="w-4 h-4 mr-1 text-blue-500" />
          New Ride Request
        </h4>
        <button 
          onClick={onDecline}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mt-2 text-sm">
        <div className="flex items-center mb-1">
          <MapPin className="w-3 h-3 text-blue-500 mr-1 flex-shrink-0" />
          <span className="text-gray-600 truncate">
            {request.pickupLocationName || "Pickup location"}
          </span>
        </div>
        <div className="flex items-center mb-1">
          <Navigation className="w-3 h-3 text-red-500 mr-1 flex-shrink-0" />
          <span className="text-gray-600 truncate">
            {request.dropoffLocationName || "Dropoff location"}
          </span>
        </div>
        <div className="flex items-center mb-1">
          <DollarSign className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
          <span className="text-gray-600">
            NPR {request.fare || "0"}
            {request.distance && (
              <span className="text-xs text-gray-500 ml-1">
                ({request.distance.toFixed(1)} km)
              </span>
            )}
          </span>
        </div>
      </div>
      
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onAccept(request)}
          disabled={isAccepting}
          className={`flex-1 py-2 text-sm font-medium rounded-lg ${
            isAccepting
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isAccepting ? (
            <div className="flex items-center justify-center">
              <Loader className="w-3 h-3 mr-1 animate-spin" />
              Accepting...
            </div>
          ) : (
            "Accept"
          )}
        </button>
        <button
          onClick={onDecline}
          className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

export default RideNotification;