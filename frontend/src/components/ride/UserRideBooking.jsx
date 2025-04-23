import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { requestRide } from "../Slices/rideSlice";
import { Toaster, toast } from "sonner";
import {
  MapPin,
  Navigation,
  ArrowRight,
  Car,
  Bike,
  Zap, // For Electric vehicle icon
  RotateCw, // For refresh icon
  Locate, // For current location
  AlertTriangle, // For traffic warning
  Clock, // For time indicator
} from "lucide-react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import MapContainer from "./MapContainer";
import MapSection from "./MapSection";
import socketService from "../socket/socketService";
// Import traffic utilities
import {
  getTrafficCondition,
  calculateFareWithTraffic,
  getTrafficDescription,
  getTrafficColorClass,
  getTrafficBgClass,
} from "../../utils/mapUtills";

// Fix: removing dependency on process.env which causes the error
// Using constants instead
const BACKEND_URL = "http://localhost:3301";

// Validate form function
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

// Main Component
const RideBooking = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // From Redux
  const { user } = useSelector((state) => state.auth) || {};
  const { loading: rideLoading = {} } =
    useSelector((state) => state.ride) || {};

  // Socket states
  const [socketConnected, setSocketConnected] = useState(false);
  const [driversNotified, setDriversNotified] = useState(0);
  const [searchingDrivers, setSearchingDrivers] = useState(false);
  const [rideAccepted, setRideAccepted] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [currentRideId, setCurrentRideId] = useState(null);

  // Map & Autocomplete references
  const mapRef = useRef(null);
  const pickupAutocompleteRef = useRef(null);
  const dropoffAutocompleteRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const routeCacheRef = useRef(new Map()); // Cache for route calculations

  // State
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 27.7172, lng: 85.324 }); // Kathmandu

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

  // Traffic and dynamic pricing states
  const [trafficCondition, setTrafficCondition] = useState("light");
  const [baseFare, setBaseFare] = useState(0);
  const [trafficMultiplier, setTrafficMultiplier] = useState(1.0);
  const [normalFare, setNormalFare] = useState(0);
  const [isCheckingTraffic, setIsCheckingTraffic] = useState(false);

  // Form
  const [formErrors, setFormErrors] = useState({});
  const [showSummary, setShowSummary] = useState(false);

  // Socket setup
  useEffect(() => {
    // Connect to socket server if not already connected
    if (!socketService.connected) {
      socketService.connect();
    }

    // Setup socket event handlers
    const handleConnect = () => {
      console.log("Socket connected");
      setSocketConnected(true);

      // Send user info on connect/reconnect
      if (user?._id) {
        socketService.socket.emit("user_connected", {
          userId: user._id,
          role: user.role || "user",
          location: pickupLocation,
          timestamp: new Date(),
        });
      }
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setSocketConnected(false);
    };

    const handleDriversNotified = (data) => {
      console.log(`${data.count} drivers notified about ride ${data.rideId}`);
      setDriversNotified(data.count);
      setSearchingDrivers(true);
      setCurrentRideId(data.rideId);

      if (data.count > 0) {
        toast.success(`${data.count} nearby drivers have been notified!`);
      } else {
        toast.info(
          "No drivers are currently available in your area. Please try again later."
        );
      }
    };

    // Handle when a driver accepts the ride
    const handleDriverAccepted = (data) => {
      console.log("Driver accepted the ride:", data);
      setRideAccepted(true);
      setSearchingDrivers(false);
      setDriverInfo({
        name: data.driverName || "Your Driver",
        vehicleType: vehicleType,
        licensePlate: data.driverLicensePlate || "",
      });

      // Set initial driver location (either from data or random nearby location)
      if (data.driverLocation) {
        setDriverLocation(data.driverLocation);
      } else if (pickupLocation) {
        // Create a random location slightly away from pickup
        const randomOffset = () => (Math.random() - 0.5) * 0.01; // ~1km offset
        setDriverLocation({
          lat: pickupLocation.lat + randomOffset(),
          lng: pickupLocation.lng + randomOffset(),
        });
      }

      setEstimatedArrival(data.estimatedArrival || "10-15 minutes");

      toast.success(
        `${
          data.driverName || "A driver"
        } has accepted your ride and is on the way!`,
        { duration: 5000 }
      );

      // Navigate to ride status page after a short delay
      setTimeout(() => {
        navigate("/ridestatus");
      }, 3000);
    };

    // Handle driver location updates
    const handleDriverLocationUpdate = (data) => {
      console.log("Driver location updated:", data);
      if (data.location) {
        setDriverLocation(data.location);
      }
      if (data.estimatedArrival) {
        setEstimatedArrival(data.estimatedArrival);
      }
    };

    // Add event listeners
    socketService.socket.on("connect", handleConnect);
    socketService.socket.on("disconnect", handleDisconnect);
    socketService.socket.on("drivers_notified", handleDriversNotified);
    socketService.socket.on("driver_accepted", handleDriverAccepted);
    socketService.socket.on(
      "driver_location_changed",
      handleDriverLocationUpdate
    );

    // Set initial connection status
    setSocketConnected(socketService.connected);

    // Clean up on unmount
    return () => {
      socketService.socket.off("connect", handleConnect);
      socketService.socket.off("disconnect", handleDisconnect);
      socketService.socket.off("drivers_notified", handleDriversNotified);
      socketService.socket.off("driver_accepted", handleDriverAccepted);
      socketService.socket.off(
        "driver_location_changed",
        handleDriverLocationUpdate
      );
    };
  }, [navigate, vehicleType, pickupLocation, user]);

  // Calculate fare - updated with traffic conditions
  const calculateFare = useCallback((distKm, type, traffic = "light") => {
    // Use the imported utility function
    const fareDetails = calculateFareWithTraffic(distKm, type, traffic);

    // Update all fare-related states
    setBaseFare(fareDetails.baseFare);
    setTrafficMultiplier(fareDetails.trafficMultiplier);
    setNormalFare(fareDetails.normalFare);
    setFare(fareDetails.trafficAdjustedFare);

    return fareDetails.trafficAdjustedFare;
  }, []);

  // Check traffic conditions - new function
  const checkTrafficConditions = useCallback(async (origin, destination) => {
    if (!origin || !destination) return "light";

    setIsCheckingTraffic(true);
    try {
      // Call the API to get traffic condition
      const traffic = await getTrafficCondition(origin, destination);
      setTrafficCondition(traffic);
      return traffic;
    } catch (error) {
      console.error("Error checking traffic:", error);
      setTrafficCondition("light");
      return "light";
    } finally {
      setIsCheckingTraffic(false);
    }
  }, []);

  // Calculate route - updated with traffic check
  const calculateRoute = useCallback(
    async (origin, destination) => {
      if (!directionsServiceRef.current || !origin || !destination) return;

      // Create a cache key for this route
      const cacheKey = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}-${vehicleType}`;

      // Check cache first
      if (routeCacheRef.current.has(cacheKey)) {
        const cachedData = routeCacheRef.current.get(cacheKey);
        setDirections(cachedData.directions);
        setDistance(cachedData.distance);
        setEstimatedTime(cachedData.duration);
        setTrafficCondition(cachedData.trafficCondition || "light");
        calculateFare(
          cachedData.distance,
          vehicleType,
          cachedData.trafficCondition || "light"
        );
        setShowSummary(true);
        return;
      }

      // First check traffic conditions
      toast.info("Checking current traffic conditions...");
      const traffic = await checkTrafficConditions(origin, destination);

      directionsServiceRef.current.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: window.google.maps.TrafficModel.BEST_GUESS,
          },
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

            // Store in cache with traffic data
            routeCacheRef.current.set(cacheKey, {
              directions: result,
              distance: distKm,
              duration: durMins,
              trafficCondition: traffic,
            });

            setDistance(distKm);
            setEstimatedTime(durMins);

            // Calculate fare with traffic
            calculateFare(distKm, vehicleType, traffic);
            setShowSummary(true);

            // Show toast notification about traffic if not light
            if (traffic !== "light") {
              const message = getTrafficDescription(traffic);
              toast(message, {
                icon: (
                  <AlertTriangle className={getTrafficColorClass(traffic)} />
                ),
              });
            }
          } else {
            toast.error(`Failed to get directions: ${status}`);
          }
        }
      );
    },
    [vehicleType, calculateFare, checkTrafficConditions]
  );

  // On map load - optimized with useCallback
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    setMapLoaded(true);
  }, []);

  // Initialize DirectionsService once when Google Maps is loaded
  useEffect(() => {
    if (mapLoaded && window.google) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
    }
  }, [mapLoaded]);

  // Initialize pickup & drop-off autocomplete
  const pickupInputRef = useRef(null);
  const dropoffInputRef = useRef(null);

  useEffect(() => {
    if (!mapLoaded || !window.google) return;
    if (!pickupInputRef.current || !dropoffInputRef.current) return;

    // Cleanup function to remove listeners
    const cleanupAutocomplete = () => {
      if (pickupAutocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          pickupAutocompleteRef.current
        );
        pickupAutocompleteRef.current = null;
      }
      if (dropoffAutocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          dropoffAutocompleteRef.current
        );
        dropoffAutocompleteRef.current = null;
      }
    };

    // Clean up existing listeners
    cleanupAutocomplete();

    // Create new autocomplete instances
    pickupAutocompleteRef.current = new window.google.maps.places.Autocomplete(
      pickupInputRef.current
    );
    dropoffAutocompleteRef.current = new window.google.maps.places.Autocomplete(
      dropoffInputRef.current
    );

    // Set autocomplete options
    const options = {
      types: ["geocode"],
      componentRestrictions: { country: "np" }, // Restrict to Nepal
    };

    pickupAutocompleteRef.current.setOptions(options);
    dropoffAutocompleteRef.current.setOptions(options);

    // Listen for place changes with optimized handlers
    const onPickupPlaceChanged = () => {
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
    };

    const onDropoffPlaceChanged = () => {
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
    };

    pickupAutocompleteRef.current.addListener(
      "place_changed",
      onPickupPlaceChanged
    );
    dropoffAutocompleteRef.current.addListener(
      "place_changed",
      onDropoffPlaceChanged
    );

    // Return cleanup function
    return cleanupAutocomplete;
  }, [mapLoaded, calculateRoute, pickupLocation, dropoffLocation]);

  // "Find Ride" button handler
  const handleFindRide = useCallback(() => {
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
  }, [
    pickupLocation,
    dropoffLocation,
    pickupLocationName,
    dropoffLocationName,
    calculateRoute,
  ]);

  // Request Ride handler with socket integration and traffic data
  const handleRequestRide = useCallback(() => {
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

    // Reset socket state
    setDriversNotified(0);
    setSearchingDrivers(true);

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
      trafficCondition, // New field for traffic condition
      paymentMethod: "cash",
    };

    // First dispatch the Redux action to save in the database
    dispatch(requestRide(rideData))
      .unwrap()
      .then((res) => {
        if (res.success) {
          toast.success("Ride requested successfully!");

          // Then emit the socket event with the ride ID
          if (socketConnected) {
            const socketRideData = {
              ...rideData,
              rideId: res.data._id,
              passengerName: user.fullName || user.username,
              passengerPhone: user.phone,
              timestamp: new Date(),
            };

            socketService.socket.emit("ride_requested", socketRideData);
            toast.info("Searching for drivers near you...");

            // Store the ride ID
            setCurrentRideId(res.data._id);
          } else {
            toast.warning("Real-time service is offline. Reconnecting...");
            // Try to reconnect socket
            socketService.connect();
          }
        } else {
          toast.error(res.message || "Failed to request ride");
          setSearchingDrivers(false);
        }
      })
      .catch((err) => {
        toast.error(`Error requesting ride: ${err}`);
        setSearchingDrivers(false);
      });
  }, [
    user,
    navigate,
    socketConnected,
    pickupLocation,
    dropoffLocation,
    pickupLocationName,
    dropoffLocationName,
    vehicleType,
    distance,
    estimatedTime,
    fare,
    trafficCondition, // Include traffic condition
    dispatch,
  ]);

  // Refresh traffic data - new function
  const handleRefreshTraffic = useCallback(() => {
    if (pickupLocation && dropoffLocation) {
      toast.info("Refreshing traffic data...");
      checkTrafficConditions(pickupLocation, dropoffLocation)
        .then((traffic) => {
          calculateFare(distance, vehicleType, traffic);
          toast.success("Traffic information updated");
        })
        .catch((err) => {
          toast.error("Failed to update traffic data");
          console.error(err);
        });
    }
  }, [
    pickupLocation,
    dropoffLocation,
    checkTrafficConditions,
    calculateFare,
    distance,
    vehicleType,
  ]);

  // Vehicle Type Selection UI
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
          calculateFare(distance, "Bike", trafficCondition);
        }}
      >
        <Bike
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
          calculateFare(distance, "Car", trafficCondition);
        }}
      >
        <Car
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
          calculateFare(distance, "Electric", trafficCondition);
        }}
      >
        <Zap
          size={24}
          className={
            vehicleType === "Electric" ? "text-blue-500" : "text-gray-500"
          }
        />
        <span className="mt-2 font-medium">Electric</span>
      </button>
    </div>
  );

  // Use my current location function
  const handleUseMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      toast.info("Getting your location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setPickupLocation(loc);
          setMapCenter(loc);

          // Try to reverse geocode to get address
          if (window.google && mapLoaded) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: loc }, (results, status) => {
              if (status === "OK" && results[0]) {
                setPickupLocationName(results[0].formatted_address);
              } else {
                setPickupLocationName(
                  `Lat: ${loc.lat.toFixed(5)}, Lng: ${loc.lng.toFixed(5)}`
                );
              }
            });
          } else {
            setPickupLocationName(
              `Lat: ${loc.lat.toFixed(5)}, Lng: ${loc.lng.toFixed(5)}`
            );
          }

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

          toast.success("Current location set as pickup");
        },
        (error) => {
          toast.error(`Error getting location: ${error.message}`);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  }, [mapLoaded, dropoffLocation, calculateRoute]);

  // Render traffic badge
  const renderTrafficBadge = () => {
    const colorClass = getTrafficColorClass(trafficCondition);
    const bgClass = getTrafficBgClass(trafficCondition);

    return (
      <div className={`flex items-center ${colorClass}`}>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${bgClass} ${colorClass} flex items-center`}
        >
          <Clock className="w-4 h-4 mr-1" />
          {trafficCondition === "heavy"
            ? "Heavy Traffic"
            : trafficCondition === "moderate"
            ? "Moderate Traffic"
            : "Light Traffic"}
        </div>
        <button
          onClick={handleRefreshTraffic}
          disabled={isCheckingTraffic}
          className="ml-2 text-blue-500 hover:text-blue-700 disabled:opacity-50"
          title="Refresh traffic data"
        >
          <RotateCw
            className={`w-4 h-4 ${isCheckingTraffic ? "animate-spin" : ""}`}
          />
        </button>
      </div>
    );
  };

  // Main Render
  return (
    <>
      <Navbar />
      <Toaster richColors />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Book a Ride</h1>

        {/* Socket connection status */}
        <div
          className={`flex items-center mb-4 text-sm ${
            socketConnected ? "text-green-600" : "text-red-500"
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              socketConnected ? "bg-green-600" : "bg-red-500"
            }`}
          ></div>
          <span>
            {socketConnected
              ? "Connected to real-time service"
              : "Offline mode - reconnecting..."}
          </span>
          {!socketConnected && (
            <button
              onClick={() => socketService.connect()}
              className="ml-2 text-blue-500 hover:text-blue-700"
              title="Try reconnecting"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 p-4">
          {/* Google Maps - Optimized */}
          <MapContainer>
            <MapSection
              pickupLocation={pickupLocation}
              dropoffLocation={dropoffLocation}
              directions={directions}
              onMapLoad={onMapLoad}
              mapCenter={mapCenter}
              driverLocation={driverLocation}
              driverInfo={driverInfo}
              isRideAccepted={rideAccepted}
              estimatedArrival={estimatedArrival}
              trafficCondition={trafficCondition} // Pass traffic condition to map
            />
          </MapContainer>

          {/* Pickup/Dropoff Inputs */}
          <div className="mt-4 space-y-4">
            {/* Pickup */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MapPin className="text-green-500" />
              </div>
              <input
                ref={pickupInputRef}
                type="text"
                placeholder="Pickup location"
                className={`w-full pl-10 pr-14 py-3 border ${
                  formErrors.pickup || formErrors.pickupCoords
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } rounded-lg focus:outline-none focus:ring-2`}
                value={pickupLocationName}
                onChange={(e) => {
                  setPickupLocationName(e.target.value);
                  if (!e.target.value) {
                    setPickupLocation(null);
                  }
                }}
              />
              <button
                onClick={handleUseMyLocation}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-500"
                title="Use my current location"
              >
                <Locate size={20} />
              </button>
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
                <Navigation className="text-red-500" />
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
                  if (!e.target.value) {
                    setDropoffLocation(null);
                  }
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
                <ArrowRight className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleRequestRide}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
                disabled={
                  rideLoading.requestRide || searchingDrivers || rideAccepted
                }
              >
                {rideLoading.requestRide
                  ? "Requesting..."
                  : searchingDrivers
                  ? "Finding Drivers..."
                  : rideAccepted
                  ? "Driver on the way!"
                  : "Request Ride"}
              </button>
            )}
          </div>
        </div>

        {/* Show summary if route found */}
        {showSummary && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Ride Summary</h3>
              {/* Display traffic badge */}
              {renderTrafficBadge()}
            </div>

            {/* Traffic multiplier info */}
            {trafficCondition !== "light" && (
              <div
                className={`mb-4 p-3 rounded-lg ${getTrafficBgClass(
                  trafficCondition
                )} flex items-start`}
              >
                <AlertTriangle
                  className={`${getTrafficColorClass(
                    trafficCondition
                  )} w-5 h-5 mr-2 mt-0.5 flex-shrink-0`}
                />
                <div>
                  <p
                    className={`${getTrafficColorClass(
                      trafficCondition
                    )} font-medium`}
                  >
                    {trafficCondition === "heavy"
                      ? "Surge Pricing in Effect"
                      : "Dynamic Pricing Applied"}
                  </p>
                  <p className="text-sm mt-1">
                    {getTrafficDescription(trafficCondition)} Base fare has been
                    adjusted with a {(trafficMultiplier - 1) * 100}% increase.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Distance</p>
                <p className="font-medium">{distance.toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Time</p>
                <p className="font-medium">{estimatedTime} min</p>
              </div>

              {/* Show fare details */}
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Fare Breakdown</p>
                <div className="mt-1 border-t border-gray-100 pt-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Fare:</span>
                    <span>NPR {baseFare}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Distance ({distance.toFixed(1)} km):</span>
                    <span>NPR {normalFare - baseFare}</span>
                  </div>

                  {trafficCondition !== "light" && (
                    <div
                      className={`flex justify-between text-sm mt-1 ${getTrafficColorClass(
                        trafficCondition
                      )}`}
                    >
                      <span>
                        Traffic Adjustment ({(trafficMultiplier - 1) * 100}%):
                      </span>
                      <span>NPR {fare - normalFare}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-medium mt-2 pt-2 border-t border-gray-100">
                    <span>Total Fare:</span>
                    <span>NPR {fare}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Vehicle Type</p>
                <p className="font-medium">{vehicleType}</p>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle selection if route found */}
        {showSummary && !rideAccepted && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="font-medium mb-3">Change Vehicle Type</h3>
            {renderVehicleTypeSelection()}
          </div>
        )}

        {/* Driver info if ride accepted */}
        {rideAccepted && driverInfo && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="font-medium mb-3">Driver Information</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Car className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <p className="font-medium text-lg">{driverInfo.name}</p>
                <p className="text-sm text-gray-600">
                  {driverInfo.vehicleType} • {driverInfo.licensePlate}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Arriving in {estimatedArrival}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default RideBooking;
