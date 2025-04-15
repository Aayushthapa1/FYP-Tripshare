"use client";

import { useEffect, useState, useRef } from "react";
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
  Search,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import {
  createTrip,
  updateTrip,
  deleteTrip,
  resetTripState,
} from "../Slices/tripSlice";
import Navbar from "./../layout/Navbar";
import Footer from "./../layout/Footer";
import RoutePreviewMap from "./RoutePreviewMap";

// Get Google Maps API Key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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

  // Refs for Google Places Autocomplete
  const departureInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const autocompleteFromRef = useRef(null);
  const autocompleteToRef = useRef(null);

  // Store selected place details
  const [departureDetails, setDepartureDetails] = useState(null);
  const [destinationDetails, setDestinationDetails] = useState(null);

  // Loading state for Places API
  const [placesApiLoaded, setPlacesApiLoaded] = useState(false);
  const [isGoogleMapsScriptLoaded, setIsGoogleMapsScriptLoaded] =
    useState(false);

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

  // Load Google Maps script dynamically if not already loaded
  useEffect(() => {
    // Check if script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsGoogleMapsScriptLoaded(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      return;
    }

    // Create script tag and load Google Maps API
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=initPlacesCallback`;
    script.async = true;
    script.defer = true;

    // Create a global callback function
    window.initPlacesCallback = () => {
      setIsGoogleMapsScriptLoaded(true);
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      // Clean up the global callback
      window.initPlacesCallback = null;

      // Optionally remove the script tag on unmount
      // document.head.removeChild(script);
    };
  }, []);

  // Initialize Places Autocomplete when Google Maps script is loaded
  useEffect(() => {
    if (!isGoogleMapsScriptLoaded) return;

    initPlacesAutocomplete();
  }, [isGoogleMapsScriptLoaded]);

  // Function to initialize Places Autocomplete
  const initPlacesAutocomplete = () => {
    if (!departureInputRef.current || !destinationInputRef.current) return;

    try {
      // Create autocomplete instances
      autocompleteFromRef.current = new window.google.maps.places.Autocomplete(
        departureInputRef.current,
        { types: ["(cities)"] } // Restrict to cities for broader locations
      );

      autocompleteToRef.current = new window.google.maps.places.Autocomplete(
        destinationInputRef.current,
        { types: ["(cities)"] }
      );

      // Add place_changed event listeners
      autocompleteFromRef.current.addListener("place_changed", () => {
        const place = autocompleteFromRef.current.getPlace();
        handlePlaceSelect(place, "departure");
      });

      autocompleteToRef.current.addListener("place_changed", () => {
        const place = autocompleteToRef.current.getPlace();
        handlePlaceSelect(place, "destination");
      });

      setPlacesApiLoaded(true);
    } catch (err) {
      console.error("Error initializing Places Autocomplete:", err);
      toast.error("Couldn't initialize location search", {
        description:
          "Please try entering locations manually or refresh the page.",
      });
    }
  };

  // Handle selected place
  const handlePlaceSelect = (place, type) => {
    if (!place.geometry) {
      toast.warning(`No details available for this location`, {
        description: "Please select a location from the dropdown list",
        duration: 3000,
      });
      return;
    }

    const locationName = place.formatted_address || place.name;
    setIsFormDirty(true);

    if (type === "departure") {
      setFormData((prev) => ({
        ...prev,
        departureLocation: locationName,
      }));
      setDepartureDetails({
        name: locationName,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        destinationLocation: locationName,
      }));
      setDestinationDetails({
        name: locationName,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id,
      });
    }
  };

  // If editing an existing trip, load it into the form
  useEffect(() => {
    if (tripId) {
      const tripToEdit = trips.find((t) => t._id === tripId);
      if (tripToEdit) {
        setFormData(tripToEdit);

        // If the trip has location details, set them
        if (tripToEdit.departureLocationDetails) {
          setDepartureDetails({
            name: tripToEdit.departureLocation,
            lat: tripToEdit.departureLocationDetails.coordinates.lat,
            lng: tripToEdit.departureLocationDetails.coordinates.lng,
            placeId: tripToEdit.departureLocationDetails.placeId,
          });
        }

        if (tripToEdit.destinationLocationDetails) {
          setDestinationDetails({
            name: tripToEdit.destinationLocation,
            lat: tripToEdit.destinationLocationDetails.coordinates.lat,
            lng: tripToEdit.destinationLocationDetails.coordinates.lng,
            placeId: tripToEdit.destinationLocationDetails.placeId,
          });
        }
      }
    }
  }, [tripId, trips]);

  // Watch for success -> if we successfully created/updated, show toast & navigate
  useEffect(() => {
    if (success) {
      toast.success(
        tripId ? "Trip updated successfully" : "Trip created successfully",
        {
          description: tripId
            ? "Your trip has been updated successfully. Passengers will be notified of any changes."
            : "Your trip has been created successfully and is now visible to potential passengers.",
          icon: <CheckCircle className="text-green-500" size={18} />,
        }
      );
      // Clear out slice state so we don't re-trigger
      dispatch(resetTripState());
      // Mark the form as not dirty
      setIsFormDirty(false);

      // Reset form if creating a new trip (not editing)
      if (!tripId) {
        setFormData({
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

        // Reset place details
        setDepartureDetails(null);
        setDestinationDetails(null);
      }
    }
  }, [success, tripId, dispatch, navigate]);

  // If there's an error from the slice, show it and reset
  useEffect(() => {
    if (error) {
      let errorMessage = "We couldn't process your request at this time.";
      let errorDescription = "Please try again later.";

      // More specific error messages based on common scenarios
      if (typeof error === "string") {
        if (error.includes("network")) {
          errorMessage = "Network connection issue";
          errorDescription =
            "Please check your internet connection and try again.";
        } else if (error.includes("validation")) {
          errorMessage = "Validation error";
          errorDescription = error; // Use the actual validation error message from backend
        } else if (
          error.includes("permission") ||
          error.includes("unauthorized")
        ) {
          errorMessage = "Permission denied";
          errorDescription =
            "You don't have permission to perform this action. Please log in again.";
        } else if (error.includes("exists")) {
          errorMessage = "Trip already exists";
          errorDescription =
            "A trip with similar details already exists. Please modify your trip details.";
        } else {
          // For any other error message from backend, display it directly
          errorDescription = error;
        }
      } else if (error && typeof error === "object") {
        // Handle structured validation errors from backend
        if (error.validationErrors && Array.isArray(error.validationErrors)) {
          errorMessage = "Validation errors";
          // Join all validation errors into a single description
          errorDescription = error.validationErrors.join(", ");
        } else if (error.message) {
          errorDescription = error.message;
        }
      }

      toast.error(errorMessage, {
        description: errorDescription,
        icon: <AlertTriangle className="text-red-500" size={18} />,
      });
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

      // Real-time validation for license plate
      if (field === "plateNumber" && value.length > 0) {
        const plateNumberRegex = /^[A-Z0-9]{2,}$/i;
        if (!plateNumberRegex.test(value)) {
          toast.warning("License plate format", {
            description: "Please enter a valid license plate number",
            duration: 3000,
          });
        }
      }
    } else if (name === "price" && value <= 0 && value !== "") {
      // Real-time validation for price
      toast.warning("Price must be greater than zero", {
        duration: 3000,
      });
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else if (
      name === "availableSeats" &&
      (value < 1 || value > 8) &&
      value !== ""
    ) {
      // Real-time validation for seats
      toast.warning("Seats must be between 1 and 8", {
        duration: 3000,
      });
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      // For location fields, manually update without affecting autocomplete
      if (name === "departureLocation" || name === "destinationLocation") {
        setFormData((prev) => ({ ...prev, [name]: value }));

        // If manually changing location, reset the corresponding location details
        if (name === "departureLocation" && departureDetails) {
          setDepartureDetails(null);
        } else if (name === "destinationLocation" && destinationDetails) {
          setDestinationDetails(null);
        }
      } else {
        // Normal text/number fields
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  // Create/Update submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // don't submit if already loading

    // Prepare enhanced data with location coordinates
    const enhancedFormData = { ...formData };

    // Add location details if available
    if (departureDetails) {
      enhancedFormData.departureLocationDetails = {
        name: departureDetails.name,
        coordinates: {
          lat: departureDetails.lat,
          lng: departureDetails.lng,
        },
        placeId: departureDetails.placeId,
      };
    }

    if (destinationDetails) {
      enhancedFormData.destinationLocationDetails = {
        name: destinationDetails.name,
        coordinates: {
          lat: destinationDetails.lat,
          lng: destinationDetails.lng,
        },
        placeId: destinationDetails.placeId,
      };
    }

    try {
      let action;
      if (tripId) {
        // editing
        action = updateTrip({ tripId, tripData: enhancedFormData });
      } else {
        // creating
        action = createTrip(enhancedFormData);
      }

      // dispatch the thunk
      await dispatch(action).unwrap();
    } catch (err) {
      console.error("Operation failed:", err);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!tripId) return;

    toast.loading("Deleting trip...", { id: "trip-delete" });

    try {
      await dispatch(deleteTrip(tripId)).unwrap();
      toast.success("Trip deleted successfully", {
        description: "Any booked passengers will be notified automatically.",
        id: "trip-delete",
      });

      // Navigate away after successful deletion
      setTimeout(() => {
        navigate("/trips");
      }, 1500);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Couldn't delete this trip", {
        description: "It may have bookings or there might be a system issue.",
        id: "trip-delete",
      });
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Form validation before submission
  const showFieldError = (fieldName) => {
    const readableFieldName = fieldName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace("vehicleDetails.", "");

    toast.error(`Please enter a valid ${readableFieldName}`, {
      description: "This field is required to continue.",
      icon: <AlertTriangle className="text-red-500" size={18} />,
    });

    // Focus on the field with error
    document.querySelector(`[name="${fieldName}"]`)?.focus();
  };

  const validateForm = () => {
    // Check if required fields are filled
    const requiredFields = [
      "departureLocation",
      "destinationLocation",
      "departureDate",
      "departureTime",
      "price",
      "availableSeats",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        showFieldError(field);
        return false;
      }
    }

    // Validate price is reasonable
    if (formData.price <= 0) {
      toast.error("Please enter a valid price", {
        description: "Price must be greater than zero.",
        icon: <AlertTriangle className="text-red-500" size={18} />,
      });
      return false;
    }

    // Validate seats are within range
    if (formData.availableSeats < 1 || formData.availableSeats > 8) {
      toast.error("Invalid number of seats", {
        description: "Available seats must be between 1 and 8.",
        icon: <AlertTriangle className="text-red-500" size={18} />,
      });
      return false;
    }

    // Check vehicle details
    const vehicleFields = ["model", "color", "plateNumber"];
    for (const field of vehicleFields) {
      if (!formData.vehicleDetails[field]) {
        showFieldError(`vehicleDetails.${field}`);
        return false;
      }
    }

    // Validate license plate format (example validation)
    const plateNumberRegex = /^[A-Z0-9]{2,}$/i;
    if (!plateNumberRegex.test(formData.vehicleDetails.plateNumber)) {
      toast.error("Invalid license plate format", {
        description: "Please enter a valid license plate number.",
        icon: <AlertTriangle className="text-red-500" size={18} />,
      });
      return false;
    }

    return true;
  };

  // Modified submit handler with validation
  const handleValidatedSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    if (validateForm()) {
      handleSubmit(e);
    }
  };

  // Add this function to handle unsaved changes warning
  const handleNavigateAway = (destination) => {
    if (isFormDirty) {
      toast.warning("You have unsaved changes", {
        description: "Are you sure you want to leave without saving?",
        action: {
          label: "Leave anyway",
          onClick: () => {
            setIsFormDirty(false);
            navigate(destination);
          },
        },
        cancel: {
          label: "Stay",
          onClick: () => {},
        },
      });
    } else {
      navigate(destination);  
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
     

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
              undone and will notify any passengers who have booked.
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
         
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleValidatedSubmit} className="space-y-6">
          {/* Trip Details Section */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-green-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">
                Trip Details
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Enhanced Location Fields with Autocomplete */}
              <div className="space-y-2">
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
                    ref={departureInputRef}
                    value={formData.departureLocation}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Departure location"
                    required
                  />
                  <Search
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />

                  {/* Location Details Badge */}
                  {departureDetails && (
                    <div className="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle size={12} className="mr-1" /> Location
                      verified
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
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
                    ref={destinationInputRef}
                    value={formData.destinationLocation}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Destination location"
                    required
                  />
                  <Search
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />

                  {/* Location Details Badge */}
                  {destinationDetails && (
                    <div className="mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle size={12} className="mr-1" /> Location
                      verified
                    </div>
                  )}
                </div>
              </div>

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

            {/* Map preview of route */}
            <div className="mt-6">
              <RoutePreviewMap
                originCoords={
                  departureDetails
                    ? { lat: departureDetails.lat, lng: departureDetails.lng }
                    : null
                }
                destinationCoords={
                  destinationDetails
                    ? {
                        lat: destinationDetails.lat,
                        lng: destinationDetails.lng,
                      }
                    : null
                }
                apiKey={GOOGLE_MAPS_API_KEY}
              />
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
                  <span>
                    {tripId ? "Saving changes..." : "Creating trip..."}
                  </span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{tripId ? "Save Changes" : "Create Trip"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="flex-1 sm:flex-none bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium flex items-center justify-center gap-2"
              onClick={() => handleNavigateAway("/trips")}
            >
              <Home size={18} />
              <span>Trip List</span>
            </button>

            <button
              type="button"
              className="flex-1 sm:flex-none bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium flex items-center justify-center gap-2"
              onClick={() => handleNavigateAway("/")}
            >
              <ArrowLeft size={18} />
              <span>Home</span>
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default TripForm;
