import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Trash,
  Car,
  CheckCircle,
  Home,
  Save,
  AlertTriangle,
  X,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import {
  createTrip,
  updateTrip,
  deleteTrip,
  resetTripState,
} from "../Slices/tripSlice"; // <-- update to your actual slice path, e.g. "../store/slices/tripSlice"

const TripForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tripId } = useParams();

  // Pull the relevant parts from your Redux store
  const {
    trips = [],
    loading,
    error,
    success,
  } = useSelector((state) => state.trip);

  // For delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Track whether the form has been modified
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Local form state
  const [formData, setFormData] = useState({
    departureLocation: "",
    destinationLocation: "",
    departureDate: "",
    departureTime: "",
    price: "",
    availableSeats: "",
    vehicleDetails: {
      model: "",
      color: "",
      plateNumber: "",
    },
    preferences: {
      smoking: false,
      pets: false,
      music: false,
    },
    description: "",
  });

  // If editing an existing trip, load it into the form
  useEffect(() => {
    if (tripId) {
      const tripToEdit = trips.find((t) => t._id === tripId);
      if (tripToEdit) {
        setFormData(tripToEdit);
      }
    }
  }, [tripId, trips]);

  // Watch for success -> if we successfully created/updated, show toast & navigate
  useEffect(() => {
    if (success) {
      toast.success(
        tripId ? "Trip updated successfully" : "Trip created successfully"
      );
      // Clear out slice state so we don't re-trigger
      dispatch(resetTripState());
      // Mark the form as not dirty
      setIsFormDirty(false);
      // Go back to trip list
      navigate("/trips");
    }
  }, [success, tripId, dispatch, navigate]);

  // If there's an error from the slice, show it and reset
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(resetTripState());
    }
  }, [error, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(resetTripState());
    };
  }, [dispatch]);

  // Local form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setIsFormDirty(true);

    if (type === "checkbox") {
      // Updating preferences
      setFormData((prev) => ({
        ...prev,
        preferences: { ...prev.preferences, [name]: checked },
      }));
    } else if (name.includes("vehicleDetails.")) {
      // Updating vehicle details
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        vehicleDetails: { ...prev.vehicleDetails, [field]: value },
      }));
    } else {
      // Normal text/number fields
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Create/Update submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // don't submit if already loading

    try {
      let action;
      if (tripId) {
        // editing
        action = updateTrip({ tripId, tripData: formData });
      } else {
        // creating
        action = createTrip(formData);
      }

      // dispatch the thunk
      const result = await dispatch(action).unwrap();

      // The slice sets 'success' on fulfill, so if we get here, it's presumably okay
      if (!result) {
        toast.error("No data returned from trip action");
      }
      setIsFormDirty(false);
    } catch (err) {
      console.error("Operation failed:", err);
      toast.error("An unexpected error occurred");
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!tripId) return;
    try {
      await dispatch(deleteTrip(tripId)).unwrap();
      toast.success("Trip deleted successfully");
      navigate("/trips");
    } catch (err) {
      toast.error("Failed to delete trip");
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 mr-2" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Delete Trip</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this trip? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-gray-800 font-medium flex items-center"
              >
                <X size={18} className="mr-1" /> Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white font-medium flex items-center"
              >
                <Trash size={18} className="mr-1" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                {tripId ? "Edit Trip" : "Create New Trip"}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate("/trips")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              >
                <Home size={18} /> All Trips
              </button>

              {tripId && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1 px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors font-medium"
                  aria-label="Delete trip"
                >
                  <Trash size={18} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trip Details Section */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-green-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">
                Trip Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Location Fields */}
              {["departureLocation", "destinationLocation"].map((field) => (
                <div className="space-y-2" key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field === "departureLocation" ? "From" : "To"}
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder={
                        field === "departureLocation"
                          ? "Departure location"
                          : "Destination location"
                      }
                      required
                    />
                  </div>
                </div>
              ))}

              {/* Date/Time Fields */}
              {["departureDate", "departureTime"].map((field) => (
                <div className="space-y-2" key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field === "departureDate" ? "Date" : "Time"}
                  </label>
                  <div className="relative">
                    {field === "departureDate" ? (
                      <Calendar
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    ) : (
                      <Clock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    )}
                    <input
                      type={field === "departureDate" ? "date" : "time"}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      min={
                        field === "departureDate"
                          ? new Date().toISOString().split("T")[0]
                          : undefined
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                </div>
              ))}

              {/* Price and Seats */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="50"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Available Seats
                </label>
                <input
                  type="number"
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleChange}
                  min="1"
                  max="8"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>
          </section>

          {/* Vehicle Details Section */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Car className="text-green-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">
                Vehicle Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              {["model", "color", "plateNumber"].map((field) => (
                <div className="space-y-2" key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field === "plateNumber"
                      ? "License Plate"
                      : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type="text"
                    name={`vehicleDetails.${field}`}
                    value={formData.vehicleDetails[field]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Preferences Section */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-green-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">
                Preferences
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(formData.preferences).map(([key, value]) => (
                <div
                  key={key}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    value
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => {
                    setIsFormDirty(true);
                    setFormData((prev) => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        [key]: !prev.preferences[key],
                      },
                    }));
                  }}
                >
                  <input
                    type="checkbox"
                    name={key}
                    checked={value}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mr-3"
                  />
                  <span className="text-gray-700 capitalize">
                    {key === "music"
                      ? "Music in car"
                      : key === "smoking"
                      ? "Smoking allowed"
                      : "Pets allowed"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Description Section */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Information
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                placeholder="Add any additional details about the trip..."
              />
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
              disabled={loading || !isFormDirty}
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  <span>{tripId ? "Updating..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{tripId ? "Update Trip" : "Create Trip"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="flex-1 sm:flex-none bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium flex items-center justify-center gap-2"
              onClick={() => navigate("/trips")}
            >
              <Home size={18} />
              <span>Trip List</span>
            </button>

            <button
              type="button"
              className="flex-1 sm:flex-none bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium flex items-center justify-center gap-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft size={18} />
              <span>Home</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default TripForm;
