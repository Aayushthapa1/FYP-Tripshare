import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Trash } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { 
  createNewTrip, 
  updateExistingTrip, 
  deleteExistingTrip,
} from "../Slices/tripSlice";

const TripForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { tripId } = useParams();
  const { loading, error, success, trips } = useSelector((state) => state.trip);

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

  // Fetch trip data if editing
  useEffect(() => {
    if (tripId) {
      const tripToEdit = trips.find((trip) => trip._id === tripId);
      if (tripToEdit) {
        setFormData(tripToEdit);
      }
    }
  }, [tripId, trips]);

  // Handle success/error states
  useEffect(() => {
    if (success) {
      toast.success(tripId ? "Trip updated successfully" : "Trip created successfully");
      dispatch(resetTripState());
      navigate("/driver/schedules");
    }
    
    if (error) {
      toast.error(error);
      dispatch(resetTripState());
    }
  }, [success, error, navigate, tripId, dispatch]);

  // Reset state on unmount
  useEffect(() => {
    return () => {
      dispatch(resetTripState());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [name]: checked }
      }));
    } else if (name.includes("vehicleDetails")) {
      const [, field] = name.split(".");
      setFormData(prev => ({
        ...prev,
        vehicleDetails: { ...prev.vehicleDetails, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      const action = tripId 
        ? updateExistingTrip({ tripId, tripData: formData })
        : createNewTrip(formData);

     const result =  await dispatch(action).unwrap();

     if(!result?.Issuccess){
      toast.error(result?.ErrorMessage || "Failed to create trip");
     }
      
     toast.success(result?.Result?.message || "Trip created successfully");

      console.log(result);
    } catch (err) {
      console.error("Operation failed:", err);
    }
  };

  const handleDelete = async () => {
    if (!tripId) return;
     {
      try {
        await dispatch(deleteExistingTrip(tripId)).unwrap();
        toast.success("Trip deleted successfully");
        navigate("/driver/schedules");
      } catch (err) {
        toast.error("Failed to delete trip");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Toaster position="top-right" richColors />

      {/* Header Section */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/driver/schedules")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {tripId ? "Edit Trip" : "Create New Trip"}
        </h1>
        
        {tripId && (
          <button
            onClick={handleDelete}
            className="ml-auto flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash size={18} />
            Delete Trip
          </button>
        )}
      </div>

      {/* Trip Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Trip Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Fields */}
            {["departureLocation", "destinationLocation"].map((field) => (
              <div className="space-y-1" key={field}>
                <label className="block text-sm font-medium text-gray-700">
                  {field === "departureLocation" ? "From" : "To"}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={`${field === "departureLocation" ? "Departure" : "Destination"} location`}
                    required
                  />
                </div>
              </div>
            ))}

            {/* Date/Time Fields */}
            {["departureDate", "departureTime"].map((field) => (
              <div className="space-y-1" key={field}>
                <label className="block text-sm font-medium text-gray-700">
                  {field === "departureDate" ? "Date" : "Time"}
                </label>
                <div className="relative">
                  {field === "departureDate" ? (
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  ) : (
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  )}
                  <input
                    type={field === "departureDate" ? "date" : "time"}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    min={field === "departureDate" ? new Date().toISOString().split("T")[0] : undefined}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            ))}

            {/* Price and Seats */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Available Seats</label>
              <input
                type="number"
                name="availableSeats"
                value={formData.availableSeats}
                onChange={handleChange}
                min="1"
                max="8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Vehicle Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["model", "color", "plateNumber"].map((field) => (
              <div className="space-y-1" key={field}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}
                </label>
                <input
                  type="text"
                  name={`vehicleDetails.${field}`}
                  value={formData.vehicleDetails[field]}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            ))}
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h2>
          <div className="flex flex-wrap gap-6">
            {Object.entries(formData.preferences).map(([key, value]) => (
              <label className="flex items-center gap-2" key={key}>
                <input
                  type="checkbox"
                  name={key}
                  checked={value}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-gray-700 capitalize">
                  {key} {key === "music" ? "in car" : "allowed"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Description Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Additional Information</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Add any additional details about the trip..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              {tripId ? "Updating..." : "Creating..."}
            </span>
          ) : tripId ? "Update Trip" : "Create Trip"}
        </button>
      </form>
    </div>
  );
};

export default TripForm;