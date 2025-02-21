import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import { Toaster, toast } from "sonner";
import axiosInstance from "../../utils/axiosInstance";
import tripService from "../../services/tripService";

const TripForm = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    departureLocation: "",
    destinationLocation: "",
    departureDate: "",
    departureTime: "",
    price: "",
    availableSeats: "",
    description: "",
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
  });

  useEffect(() => {
    if (tripId) {
      fetchTripDetails();
    } else {
      // Call createTrips when initializing the form for a new trip
      initializeNewTrip();
    }
  }, [tripId]);

  const initializeNewTrip = async () => {
    try {
      const response = await tripService.createTrips();
      // If needed, you can initialize the form with any default data returned from the API
      console.log("New trip initialization data:", response);
    } catch (error) {
      console.error("Error initializing new trip:", error);
      toast.error("Failed to initialize new trip form");
    }
  };

  const fetchTripDetails = async () => {
    try {
      const response = await axiosInstance.get(`/api/trips/${tripId}`);

      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      const data = response.data;

      if (data.IsSuccess) {
        const trip = data.Data.trip;
        setFormData({
          departureLocation: trip.departureLocation,
          destinationLocation: trip.destinationLocation,
          departureDate: new Date(trip.departureDate)
            .toISOString()
            .split("T")[0],
          departureTime: trip.departureTime,
          price: trip.price,
          availableSeats: trip.availableSeats,
          description: trip.description || "",
          vehicleDetails: trip.vehicleDetails || {
            model: "",
            color: "",
            plateNumber: "",
          },
          preferences: trip.preferences || {
            smoking: false,
            pets: false,
            music: false,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching trip details:", error);
      toast.error("Failed to fetch trip details");
      navigate("/driver/schedules");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = tripId ? `/api/trips/${tripId}` : "/api/trips/create";
      const method = tripId ? "PUT" : "POST";

      const response = await axiosInstance[method.toLowerCase()](url, formData);

      // Handle unauthorized access
      if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      const data = response.data;

      if (data.IsSuccess) {
        toast.success(
          tripId ? "Trip updated successfully" : "Trip created successfully"
        );
        navigate("/driver/schedules");
      } else {
        toast.error(data.ErrorMessage?.[0]?.message || "Failed to save trip");
      }
    } catch (error) {
      console.error("Error saving trip:", error);
      toast.error("Error saving trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Toaster position="top-right" />

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/driver/schedules")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {tripId ? "Edit Trip" : "Create New Trip"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Trip Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                From
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  name="departureLocation"
                  value={formData.departureLocation}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Departure location"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                To
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  name="destinationLocation"
                  value={formData.destinationLocation}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Destination location"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="date"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <div className="relative">
                <Clock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="time"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-1">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Vehicle Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Vehicle Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Vehicle Model
              </label>
              <input
                type="text"
                name="vehicleDetails.model"
                value={formData.vehicleDetails.model}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Color
              </label>
              <input
                type="text"
                name="vehicleDetails.color"
                value={formData.vehicleDetails.color}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Plate Number
              </label>
              <input
                type="text"
                name="vehicleDetails.plateNumber"
                value={formData.vehicleDetails.plateNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Preferences
          </h2>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="preferences.smoking"
                checked={formData.preferences.smoking}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-gray-700">Smoking allowed</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="preferences.pets"
                checked={formData.preferences.pets}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-gray-700">Pets allowed</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="preferences.music"
                checked={formData.preferences.music}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-gray-700">Music in car</span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Additional Information
            </label>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
              {tripId ? "Updating Trip..." : "Creating Trip..."}
            </>
          ) : tripId ? (
            "Update Trip"
          ) : (
            "Create Trip"
          )}
        </button>
      </form>
    </div>
  );
};

export default TripForm;