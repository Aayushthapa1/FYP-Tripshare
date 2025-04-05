import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPendingRides, updateRideStatus } from "../Slices/rideSlice";
import { Toaster, toast } from "sonner";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import {
  MapPin,
  Navigation,
  Clock,
  Car,
  CheckCircle,
  AlertTriangle,
  Loader,
  RefreshCw,
  Search,
  Calendar,
  DollarSign,
  User,
} from "lucide-react";

/**
 * A driver page that fetches all unassigned, requested rides
 * and displays them in a list. The driver can click "Accept Ride"
 * to claim it (which typically sets driverId & changes status).
 */
const DriverPendingRides = () => {
  const dispatch = useDispatch();

  // De-structure from state.ride with a fallback for pendingRides
  const {
    pendingRides = [],
    loading,
    error,
  } = useSelector((state) => state.ride) || {};

  // Local state for filtering and UI
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmRide, setConfirmRide] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // On mount, fetch all pending rides
    dispatch(getPendingRides());
  }, [dispatch]);

  const handleRefresh = () => {
    setRefreshing(true);
    dispatch(getPendingRides())
      .then(() => {
        setRefreshing(false);
        toast.success("Ride list updated");
      })
      .catch(() => {
        setRefreshing(false);
      });
  };

  const handleAcceptRide = async (ride) => {
    try {
      // Possibly pass driverId or other fields if needed
      const result = await dispatch(
        updateRideStatus({
          rideId: ride._id,
          status: "accepted",
        })
      ).unwrap();

      if (result.success) {
        toast.success("Ride accepted successfully!");
        setConfirmRide(null);
        // Optionally re-fetch pending rides to remove the accepted ride from the list
        dispatch(getPendingRides());
      } else {
        toast.error(result.message || "Failed to accept ride");
      }
    } catch (err) {
      toast.error(`Error accepting ride: ${err}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  // Format location data to be more user-friendly
  const formatLocation = (location) => {
    if (!location) return "Not specified";

    // If it's a string, return it directly
    if (typeof location === "string") return location;

    // If it has an address property, use that
    if (location.address) return location.address;

    // If it has latitude and longitude
    if (location.latitude && location.longitude) {
      // Format to 6 decimal places max for readability
      const lat = parseFloat(location.latitude).toFixed(6);
      const lng = parseFloat(location.longitude).toFixed(6);

      // Check if we have a name property to use
      if (location.name) return location.name;

      // Return formatted coordinates
      return `${lat}, ${lng}`;
    }

    // If it's an object but we can't extract useful info
    return "Location details unavailable";
  };

  // Filter rides based on search term
  const filteredRides = pendingRides.filter((ride) => {
    const pickupLocation = formatLocation(
      ride.pickupLocation || ride.pickupLocationName
    );
    const destination = formatLocation(
      ride.destination || ride.dropoffLocationName
    );

    return (
      pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate estimated earnings
  const getEstimatedEarnings = (ride) => {
    if (!ride.fare) return "Varies";

    // Assuming driver gets 80% of the fare
    const driverShare = parseFloat(ride.fare) * 0.8;
    return `₹${driverShare.toFixed(0)}`;
  };

  return (
    <>
      <Navbar />

      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold flex items-center">
                    <Car className="mr-2" /> Available Rides
                  </h1>
                  <p className="text-green-100 mt-1">
                    Find and accept ride requests from passengers
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefresh}
                    className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
                    disabled={refreshing || loading}
                    title="Refresh rides"
                  >
                    <RefreshCw
                      className={`w-5 h-5 text-white ${
                        refreshing ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by location or ride ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader className="w-10 h-10 text-green-500 animate-spin mb-4" />
                  <p className="text-gray-600">Loading available rides...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium text-red-800">
                        Error Loading Rides
                      </h3>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && filteredRides.length === 0 && (
                <div className="text-center py-12">
                  <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    No Rides Available
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {searchTerm
                      ? "No rides match your search criteria."
                      : "There are no pending ride requests at the moment."}
                  </p>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                  </button>
                </div>
              )}

              {/* Ride List */}
              {!loading && !error && filteredRides.length > 0 && (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {filteredRides.length}{" "}
                      {filteredRides.length === 1 ? "ride" : "rides"} available
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRides.map((ride) => (
                      <div
                        key={ride._id}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                      >
                        {/* Ride Card Header */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="ml-3">
                              <span className="text-xs text-gray-500">
                                Requested
                              </span>
                              <p className="font-medium text-gray-900">
                                {formatDate(ride.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          </div>
                        </div>

                        {/* Ride Details */}
                        <div className="p-4">
                          <div className="space-y-3">
                            {/* Pickup Location */}
                            <div className="flex items-start">
                              <div className="mt-1">
                                <MapPin className="w-5 h-5 text-blue-500" />
                              </div>
                              <div className="ml-3">
                                <p className="text-xs text-gray-500">
                                  Pickup Location
                                </p>
                                <p className="font-medium text-gray-900">
                                  {formatLocation(
                                    ride.pickupLocation ||
                                      ride.pickupLocationName
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Destination */}
                            <div className="flex items-start">
                              <div className="mt-1">
                                <Navigation className="w-5 h-5 text-red-500" />
                              </div>
                              <div className="ml-3">
                                <p className="text-xs text-gray-500">
                                  Destination
                                </p>
                                <p className="font-medium text-gray-900">
                                  {formatLocation(
                                    ride.destination || ride.dropoffLocationName
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Fare & Earnings */}
                            <div className="flex items-start">
                              <div className="mt-1">
                                <DollarSign className="w-5 h-5 text-green-500" />
                              </div>
                              <div className="ml-3">
                                <p className="text-xs text-gray-500">
                                  Estimated Earnings
                                </p>
                                <p className="font-medium text-gray-900">
                                  {getEstimatedEarnings(ride)}
                                </p>
                              </div>
                            </div>

                            {/* Passenger Info (if available) */}
                            {ride.passenger && (
                              <div className="flex items-start">
                                <div className="mt-1">
                                  <User className="w-5 h-5 text-gray-500" />
                                </div>
                                <div className="ml-3">
                                  <p className="text-xs text-gray-500">
                                    Passenger
                                  </p>
                                  <p className="font-medium text-gray-900">
                                    {ride.passenger.name || "Anonymous"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => setConfirmRide(ride)}
                              className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                            >
                              <CheckCircle className="w-5 h-5 mr-2" /> Accept
                              Ride
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Confirm Ride Acceptance
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to accept this ride? You'll be responsible
                for picking up the passenger at the designated location.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-xs text-gray-500">Pickup</p>
                      <p className="font-medium text-gray-900">
                        {formatLocation(
                          confirmRide.pickupLocation ||
                            confirmRide.pickupLocationName
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Navigation className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-xs text-gray-500">Destination</p>
                      <p className="font-medium text-gray-900">
                        {formatLocation(
                          confirmRide.destination ||
                            confirmRide.dropoffLocationName
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmRide(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAcceptRide(confirmRide)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirm Acceptance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default DriverPendingRides;
