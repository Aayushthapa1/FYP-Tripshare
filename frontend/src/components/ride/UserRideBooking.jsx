import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { requestRide } from "../Slices/rideSlice"; // <-- your ride slice
import { Toaster, toast } from "sonner";
import {
  FaMapMarkerAlt,
  FaLocationArrow,
  FaArrowRight,
  FaCar,
  FaMotorcycle,
  FaBolt,
} from "react-icons/fa";
import { MdMyLocation } from "react-icons/md";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

// 1) Styles & Constants
const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "12px",
};

const defaultCenter = {
  lat: 27.7172,
  lng: 85.324, // Kathmandu
};

const libraries = ["places", "directions"];

// 2) Simple form validation
const validateForm = (
  pickupLocation,
  dropoffLocation,
  pickupLocationName,
  dropoffLocationName
) => {
  const errors = {};

  if (!pickupLocationName) {
    errors.pickup = "Pickup location is required";
  }
  if (!dropoffLocationName) {
    errors.dropoff = "Dropoff location is required";
  }
  if (!pickupLocation && pickupLocationName) {
    errors.pickupCoords = "Select a valid pickup location from suggestions";
  }
  if (!dropoffLocation && dropoffLocationName) {
    errors.dropoffCoords = "Select a valid dropoff location from suggestions";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// 3) Main Component
const SimpleRideBooking = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // From Redux
  const { user } = useSelector((state) => state.auth) || {};
  const { loading: rideLoading = {} } =
    useSelector((state) => state.ride) || {};

  // Map & Autocomplete references
  const mapRef = useRef(null);
  const pickupAutocompleteRef = useRef(null);
  const dropoffAutocompleteRef = useRef(null);
  const directionsServiceRef = useRef(null);

  // State
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // Location inputs
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [pickupLocationName, setPickupLocationName] = useState("");
  const [dropoffLocationName, setDropoffLocationName] = useState("");

  // Travel info
  const [vehicleType, setVehicleType] = useState("Car");
  const [distance, setDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [fare, setFare] = useState(0);
  const [directions, setDirections] = useState(null);

  // Form
  const [formErrors, setFormErrors] = useState({});
  const [showSummary, setShowSummary] = useState(false);

  // 4) On map load
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    setMapLoaded(true);
  }, []);

  // 5) Initialize pickup & drop-off autocomplete
  const pickupInputRef = useRef(null);
  const dropoffInputRef = useRef(null);

  useEffect(() => {
    if (!mapLoaded || !window.google) return;
    if (!pickupInputRef.current || !dropoffInputRef.current) return;

    // Clear existing listeners if any
    if (pickupAutocompleteRef.current) {
      window.google.maps.event.clearInstanceListeners(
        pickupAutocompleteRef.current
      );
    }
    if (dropoffAutocompleteRef.current) {
      window.google.maps.event.clearInstanceListeners(
        dropoffAutocompleteRef.current
      );
    }

    // Create new autocomplete instances
    pickupAutocompleteRef.current = new window.google.maps.places.Autocomplete(
      pickupInputRef.current
    );
    dropoffAutocompleteRef.current = new window.google.maps.places.Autocomplete(
      dropoffInputRef.current
    );

    // Listen for place changes
    pickupAutocompleteRef.current.addListener("place_changed", () => {
      const place = pickupAutocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const loc = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setPickupLocation(loc);
        setPickupLocationName(place.formatted_address || place.name);
        setMapCenter(loc); // Center the map

        // Clear form error
        setFormErrors((prev) => ({
          ...prev,
          pickup: undefined,
          pickupCoords: undefined,
        }));

        // If drop-off is set, calculate route
        if (dropoffLocation) {
          calculateRoute(loc, dropoffLocation);
        }
      }
    });

    dropoffAutocompleteRef.current.addListener("place_changed", () => {
      const place = dropoffAutocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const loc = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setDropoffLocation(loc);
        setDropoffLocationName(place.formatted_address || place.name);

        // Clear form error
        setFormErrors((prev) => ({
          ...prev,
          dropoff: undefined,
          dropoffCoords: undefined,
        }));

        // If pickup is set, calculate route
        if (pickupLocation) {
          calculateRoute(pickupLocation, loc);
        }
      }
    });
  }, [mapLoaded, pickupLocation, dropoffLocation]);

  // 6) Calculate route
  const calculateRoute = useCallback(
    (origin, destination) => {
      if (!directionsServiceRef.current || !origin || !destination) return;

      directionsServiceRef.current.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);

            // Calculate total distance/time
            const route = result.routes[0];
            let totalDistance = 0;
            let totalDuration = 0;
            route.legs.forEach((leg) => {
              totalDistance += leg.distance.value;
              totalDuration += leg.duration.value;
            });

            const distKm = totalDistance / 1000;
            const durMins = Math.ceil(totalDuration / 60);
            setDistance(distKm);
            setEstimatedTime(durMins);

            // Calculate fare
            calculateFare(distKm, vehicleType);
            setShowSummary(true);
          } else {
            toast.error(`Failed to get directions: ${status}`);
          }
        }
      );
    },
    [vehicleType]
  );

  // 7) Calculate fare
  const calculateFare = useCallback((distKm, type) => {
    let baseFare = 0;
    let ratePerKm = 0;
    switch (type) {
      case "Bike":
        baseFare = 50;
        ratePerKm = 15;
        break;
      case "Car":
        baseFare = 100;
        ratePerKm = 30;
        break;
      case "Electric":
        baseFare = 80;
        ratePerKm = 25;
        break;
      default:
        baseFare = 100;
        ratePerKm = 30;
    }
    const calculated = Math.round(baseFare + distKm * ratePerKm);
    setFare(calculated);
  }, []);

  // 8) “Find Ride” button
  const handleFindRide = () => {
    // Validate
    const validation = validateForm(
      pickupLocation,
      dropoffLocation,
      pickupLocationName,
      dropoffLocationName
    );
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      Object.values(validation.errors).forEach((err) => {
        toast.error(err);
      });
      return;
    }

    // If both coords exist, calculate route
    if (pickupLocation && dropoffLocation) {
      calculateRoute(pickupLocation, dropoffLocation);
    } else {
      toast.error("Please pick valid pickup and drop-off locations");
    }
  };

  // 9) Request Ride
  const handleRequestRide = () => {
    if (!user?._id) {
      toast.error("Please log in to request a ride");
      navigate("/login");
      return;
    }

    // Validate again
    const validation = validateForm(
      pickupLocation,
      dropoffLocation,
      pickupLocationName,
      dropoffLocationName
    );
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      Object.values(validation.errors).forEach((err) => toast.error(err));
      return;
    }

    const rideData = {
      passengerId: user._id,
      pickupLocation: {
        latitude: pickupLocation.lat,
        longitude: pickupLocation.lng,
      },
      dropoffLocation: {
        latitude: dropoffLocation.lat,
        longitude: dropoffLocation.lng,
      },
      pickupLocationName,
      dropoffLocationName,
      vehicleType,
      distance,
      estimatedTime,
      fare,
      paymentMethod: "cash",
    };

    dispatch(requestRide(rideData))
      .unwrap()
      .then((res) => {
        if (res.success) {
          toast.success("Ride requested successfully!");
          navigate("/ridestatus"); // or wherever you show ride status
        } else {
          toast.error(res.message || "Failed to request ride");
        }
      })
      .catch((err) => {
        toast.error(`Error requesting ride: ${err}`);
      });
  };

  // 10) Vehicle Type UI
  const renderVehicleTypeSelection = () => (
    <div className="grid grid-cols-3 gap-3">
      <button
        className={`p-3 rounded-lg border flex flex-col items-center ${
          vehicleType === "Bike"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200"
        }`}
        onClick={() => {
          setVehicleType("Bike");
          calculateFare(distance, "Bike");
        }}
      >
        <FaMotorcycle
          size={24}
          className={vehicleType === "Bike" ? "text-blue-500" : "text-gray-500"}
        />
        <span className="mt-2 font-medium">Bike</span>
      </button>

      <button
        className={`p-3 rounded-lg border flex flex-col items-center ${
          vehicleType === "Car"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200"
        }`}
        onClick={() => {
          setVehicleType("Car");
          calculateFare(distance, "Car");
        }}
      >
        <FaCar
          size={24}
          className={vehicleType === "Car" ? "text-blue-500" : "text-gray-500"}
        />
        <span className="mt-2 font-medium">Car</span>
      </button>

      <button
        className={`p-3 rounded-lg border flex flex-col items-center ${
          vehicleType === "Electric"
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200"
        }`}
        onClick={() => {
          setVehicleType("Electric");
          calculateFare(distance, "Electric");
        }}
      >
        <FaBolt
          size={24}
          className={
            vehicleType === "Electric" ? "text-blue-500" : "text-gray-500"
          }
        />
        <span className="mt-2 font-medium">Electric</span>
      </button>
    </div>
  );

  // 11) Render
  return (
    <>
      <Navbar />
      <Toaster richColors />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Book a Ride (Simplified)</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 p-4">
          {/* Google Maps */}
          <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
            libraries={libraries}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={13}
              onLoad={onMapLoad}
            >
              {pickupLocation && (
                <Marker
                  position={pickupLocation}
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                />
              )}

              {dropoffLocation && (
                <Marker
                  position={dropoffLocation}
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                />
              )}

              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </LoadScript>

          {/* Pickup/Dropoff Inputs */}
          <div className="mt-4 space-y-4">
            {/* Pickup */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaMapMarkerAlt className="text-green-500" />
              </div>
              <input
                ref={pickupInputRef}
                type="text"
                placeholder="Pickup location"
                className={`w-full pl-10 pr-4 py-3 border ${
                  formErrors.pickup || formErrors.pickupCoords
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } rounded-lg focus:outline-none focus:ring-2`}
                value={pickupLocationName}
                onChange={(e) => {
                  setPickupLocationName(e.target.value);
                  setPickupLocation(null);
                }}
              />
            </div>
            {formErrors.pickup && (
              <p className="text-red-500 text-sm">{formErrors.pickup}</p>
            )}
            {formErrors.pickupCoords && (
              <p className="text-red-500 text-sm">{formErrors.pickupCoords}</p>
            )}

            {/* Dropoff */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaLocationArrow className="text-red-500" />
              </div>
              <input
                ref={dropoffInputRef}
                type="text"
                placeholder="Dropoff location"
                className={`w-full pl-10 pr-4 py-3 border ${
                  formErrors.dropoff || formErrors.dropoffCoords
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } rounded-lg focus:outline-none focus:ring-2`}
                value={dropoffLocationName}
                onChange={(e) => {
                  setDropoffLocationName(e.target.value);
                  setDropoffLocation(null);
                }}
              />
            </div>
            {formErrors.dropoff && (
              <p className="text-red-500 text-sm">{formErrors.dropoff}</p>
            )}
            {formErrors.dropoffCoords && (
              <p className="text-red-500 text-sm">{formErrors.dropoffCoords}</p>
            )}
          </div>

          {/* Buttons: Find Ride / Request Ride */}
          <div className="mt-4 flex justify-between">
            {!showSummary ? (
              <button
                onClick={handleFindRide}
                className="w-full py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center"
              >
                <span>Find Ride</span>
                <FaArrowRight className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleRequestRide}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
                disabled={rideLoading.requestRide}
              >
                {rideLoading.requestRide ? "Requesting..." : "Request Ride"}
              </button>
            )}
          </div>
        </div>

        {/* Show summary if route found */}
        {showSummary && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="font-medium mb-3">Ride Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Distance</p>
                <p className="font-medium">{distance.toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Time</p>
                <p className="font-medium">{estimatedTime} min</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Fare</p>
                <p className="font-medium">NPR {fare}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vehicle Type</p>
                <p className="font-medium">{vehicleType}</p>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle selection if route found */}
        {showSummary && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="font-medium mb-3">Change Vehicle Type</h3>
            {renderVehicleTypeSelection()}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SimpleRideBooking;
