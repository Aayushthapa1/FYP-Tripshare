import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Car,
  CheckCircle,
  Home,
  Save,
  AlertTriangle,
  Search,
  User,
  Info,
  X,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { createTrip, resetTripState } from "../Slices/tripSlice";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

// Get Google Maps API Key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const TripForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Pull the relevant parts from your Redux store
  const { loading, error, success } = useSelector((state) => state.trip);

  // Get the driver KYC status from Redux store
  const { kycStatus } = useSelector((state) => state.driverKYC);

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

  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timeWarning, setTimeWarning] = useState(false);

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

  // Watch for success -> if we successfully created, show toast & navigate
  useEffect(() => {
    if (success) {
      toast.success("Trip created successfully", {
        description:
          "Your trip has been created successfully and is now visible to potential passengers.",
        icon: <CheckCircle className="text-green-500" size={18} />,
      });

      setTimeout(() => {}, 8000);

      // Clear out slice state so we don't re-trigger
      dispatch(resetTripState());

      // Mark the form as not dirty
      setIsFormDirty(false);

      // Reset form
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
  }, [success, dispatch]);

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

  // Create submit
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
      // dispatch the create trip thunk
      await dispatch(createTrip(enhancedFormData)).unwrap();
    } catch (err) {
      console.error("Trip creation failed:", err);
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

    // Validate that date is not in the past
    const selectedDate = new Date(formData.departureDate);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("Invalid departure date", {
        description: "Departure date cannot be in the past.",
        icon: <AlertTriangle className="text-red-500" size={18} />,
      });
      return false;
    }

    // For today's date, validate time is at least 5 minutes in the future
    if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();
      const [hours, minutes] = formData.departureTime.split(":").map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(hours, minutes, 0, 0);

      // Add 5 minutes buffer for minimum departure time
      const minAllowedTime = new Date();
      minAllowedTime.setMinutes(minAllowedTime.getMinutes() + 5);

      if (selectedTime < now) {
        toast.error("Invalid departure time", {
          description: "Departure time cannot be in the past.",
          icon: <AlertTriangle className="text-red-500" size={18} />,
        });
        return false;
      }

      if (selectedTime < minAllowedTime) {
        // We'll allow this but show a warning in the confirmation modal
        setTimeWarning(true);
        // Continue form validation
      }
    }

    return true;
  };

  // Format date to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if selected time is valid (not in the past and at least 5 minutes in the future for today)
  const isTimeValid = () => {
    const selectedDate = new Date(formData.departureDate);
    const today = new Date();

    // Reset time parts to compare just the dates
    const selectedDateOnly = new Date(selectedDate.setHours(0, 0, 0, 0));
    const todayOnly = new Date(today.setHours(0, 0, 0, 0));

    // If selected date is in the future, it's valid
    if (selectedDateOnly > todayOnly) {
      return true;
    }

    // If selected date is today, check if time is at least 5 minutes in the future
    if (selectedDateOnly.getTime() === todayOnly.getTime()) {
      const now = new Date();
      const [hours, minutes] = formData.departureTime.split(":").map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(hours, minutes, 0, 0);

      // Add 5 minutes minimum buffer
      const minAllowedTime = new Date();
      minAllowedTime.setMinutes(minAllowedTime.getMinutes() + 5);

      if (selectedTime < minAllowedTime) {
        return false;
      }
    }

    return true;
  };

  // Show confirmation modal after validation
  const showTripConfirmation = (e) => {
    e.preventDefault();
    if (loading) return;

    // Check if KYC is verified before proceeding
    if (kycStatus !== "verified") {
      toast.error("KYC Verification Required", {
        description: "Please submit your KYC for creating trips.",
        icon: <AlertTriangle className="text-red-500" size={18} />,
        duration: 5000,
      });
      return; // Prevent form submission if KYC is not verified
    }

    if (validateForm()) {
      // Check time validity
      if (!isTimeValid()) {
        setTimeWarning(true);
      }

      // Show confirmation modal
      setShowConfirmModal(true);
    }
  };

  // Final submit handler after confirmation
  const handleConfirmedSubmit = () => {
    setShowConfirmModal(false);
    handleSubmit(new Event("submit"));
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
      <Toaster position="top-right" richColors />

      {/* Header with Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => handleNavigateAway("/")}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Create New Trip
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleNavigateAway("/trips")}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors rounded-lg font-medium flex items-center"
              >
                <Home size={16} className="mr-1.5" /> View My Trips
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Trip Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full relative animate-fade-in overflow-y-auto max-h-[90vh]">
            <div className="bg-green-600 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-bold flex items-center">
                <Info className="mr-2" size={22} /> Confirm Trip Details
              </h2>
              <p className="text-green-100 mt-1 flex items-center">
                <MapPin size={16} className="mr-1.5" />
                {formData.departureLocation} → {formData.destinationLocation}
              </p>
            </div>

            <div className="p-6">
              {timeWarning && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                  <div className="flex items-start">
                    <AlertTriangle
                      className="mr-2 mt-0.5 text-yellow-500"
                      size={18}
                    />
                    <div>
                      <h3 className="font-medium">
                        Departure time is very soon
                      </h3>
                      <p className="text-sm mt-1">
                        Your trip is scheduled to depart in less than 5 minutes.
                        Are you sure you want to proceed?
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">
                      Departure Date
                    </h3>
                    <p className="font-medium text-gray-900">
                      {formatDate(formData.departureDate)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">
                      Departure Time
                    </h3>
                    <p className="font-medium text-gray-900">
                      {formData.departureTime}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Price</h3>
                    <p className="font-medium text-gray-900">
                      ₹{formData.price}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">
                      Available Seats
                    </h3>
                    <p className="font-medium text-gray-900">
                      {formData.availableSeats}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm text-gray-500 mb-2">
                    Vehicle Details
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">
                      {formData.vehicleDetails.model} -{" "}
                      {formData.vehicleDetails.color}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      License Plate: {formData.vehicleDetails.plateNumber}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm text-gray-500 mb-2">Preferences</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        formData.preferences.smoking
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {formData.preferences.smoking
                        ? "Smoking allowed"
                        : "No smoking"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        formData.preferences.pets
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {formData.preferences.pets ? "Pets allowed" : "No pets"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        formData.preferences.music
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {formData.preferences.music ? "Music in car" : "No music"}
                    </span>
                  </div>
                </div>

                {formData.description && (
                  <div>
                    <h3 className="text-sm text-gray-500 mb-2">
                      Additional Information
                    </h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {formData.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium flex items-center justify-center"
                >
                  <X size={16} className="mr-1.5" /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmedSubmit}
                  className="px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 font-medium flex items-center justify-center"
                >
                  <CheckCircle size={16} className="mr-1.5" /> Create Trip
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 text-white hover:text-green-100 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={showTripConfirmation} className="space-y-6">
          {/* Trip Details Section */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-green-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">
                Trip Details
              </h2>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-auto">
                Step 1 of 3
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Enhanced Location Fields with Autocomplete */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  From
                  <span className="ml-1 text-red-500">*</span>
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
                <p className="text-xs text-gray-500 mt-1">
                  Type and select a location from the dropdown
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  To
                  <span className="ml-1 text-red-500">*</span>
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
                <p className="text-xs text-gray-500 mt-1">
                  Type and select a location from the dropdown
                </p>
              </div>

              {/* Date/Time Fields */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                  Date
                  <span className="ml-1 text-red-500">*</span>
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>

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
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="number"
                    name="availableSeats"
                    value={formData.availableSeats}
                    onChange={handleChange}
                    min="1"
                    max="8"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Vehicle Details Section */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Car className="text-green-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">
                Vehicle Details
              </h2>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-auto">
                Step 2 of 3
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              {/* Vehicle Model */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Model
                </label>
                <input
                  type="text"
                  name="vehicleDetails.model"
                  value={formData.vehicleDetails.model}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="e.g. Toyota Innova"
                  required
                />
              </div>

              {/* Vehicle Color */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Color
                </label>
                <input
                  type="text"
                  name="vehicleDetails.color"
                  value={formData.vehicleDetails.color}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="e.g. Silver"
                  required
                />
              </div>

              {/* License Plate */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  License Plate
                </label>
                <input
                  type="text"
                  name="vehicleDetails.plateNumber"
                  value={formData.vehicleDetails.plateNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="e.g. MH01AB1234"
                  required
                />
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-green-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">
                Preferences
              </h2>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full ml-auto">
                Step 3 of 3
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Smoking Preference */}
              <div
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.preferences.smoking
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => {
                  setIsFormDirty(true);
                  setFormData((prev) => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      smoking: !prev.preferences.smoking,
                    },
                  }));
                }}
              >
                <input
                  type="checkbox"
                  name="smoking"
                  checked={formData.preferences.smoking}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mr-3"
                />
                <span className="text-gray-700">Smoking allowed</span>
              </div>

              {/* Pets Preference */}
              <div
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.preferences.pets
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => {
                  setIsFormDirty(true);
                  setFormData((prev) => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      pets: !prev.preferences.pets,
                    },
                  }));
                }}
              >
                <input
                  type="checkbox"
                  name="pets"
                  checked={formData.preferences.pets}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mr-3"
                />
                <span className="text-gray-700">Pets allowed</span>
              </div>

              {/* Music Preference */}
              <div
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                  formData.preferences.music
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => {
                  setIsFormDirty(true);
                  setFormData((prev) => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      music: !prev.preferences.music,
                    },
                  }));
                }}
              >
                <input
                  type="checkbox"
                  name="music"
                  checked={formData.preferences.music}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mr-3"
                />
                <span className="text-gray-700">Music in car</span>
              </div>
            </div>
          </section>

          {/* Description Section */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Info className="text-green-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">
                Additional Details
              </h2>
              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full ml-auto">
                Optional
              </span>
            </div>
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
                placeholder="Add any additional details about the trip, pickup points, or special instructions..."
              />
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transform hover:scale-105 active:scale-95 transition-all"
              disabled={loading || !isFormDirty}
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  <span>Creating trip...</span>
                </>
              ) : (
                <>
                  <ArrowRight size={18} />
                  <span>Review & Create Trip</span>
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
