"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { requestRide } from "../Slices/rideSlice";
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
import io from "socket.io-client";

// Map container styles
const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "12px",
};

// Default center (can be set to user's current location)
const defaultCenter = {
  lat: 27.7172,
  lng: 85.324, // Default to Kathmandu
};

const libraries = ["places", "directions"];

// Form validation schema
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
    errors.pickupCoords =
      "Please select a valid pickup location from the suggestions";
  }

  if (!dropoffLocation && dropoffLocationName) {
    errors.dropoffCoords =
      "Please select a valid dropoff location from the suggestions";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const SimpleRideBooking = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  // Use direct state access instead of potentially problematic selectors
  const { user } = useSelector((state) => state.auth || {});
  const { loading = {} } = useSelector((state) => state.ride || {});

  // Form state
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [pickupLocationName, setPickupLocationName] = useState("");
  const [dropoffLocationName, setDropoffLocationName] = useState("");
  const [vehicleType, setVehicleType] = useState("Car"); // Default to Car
  const [distance, setDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [fare, setFare] = useState(0);
  const [directions, setDirections] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Form validation state
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Socket.io state
  const [driverLocation, setDriverLocation] = useState(null);
  const [rideStatus, setRideStatus] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);

  const mapRef = useRef(null);
  const pickupInputRef = useRef(null);
  const dropoffInputRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const pickupAutocompleteRef = useRef(null);
  const dropoffAutocompleteRef = useRef(null);

  // Initialize Socket.io connection
  useEffect(() => {
    // Connect to the Socket.io server
    const SOCKET_URL =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    socketRef.current = io(SOCKET_URL);

    // Socket event listeners
    socketRef.current.on("connect", () => {
      toast.success("Connected to real-time service");
      console.log("Socket connected:", socketRef.current.id);
    });

    socketRef.current.on("connect_error", (error) => {
      toast.error(`Connection error: ${error.message}`);
      console.error("Socket connection error:", error);
    });

    // Listen for ride status updates
    socketRef.current.on("rideStatusUpdate", (data) => {
      setRideStatus(data.status);
      toast.info(`Ride status updated: ${data.status}`);

      if (data.status === "accepted") {
        toast.success(`Driver ${data.driver.name} has accepted your ride!`);
      } else if (data.status === "arrived") {
        toast.success("Your driver has arrived at the pickup location!");
      } else if (data.status === "started") {
        toast.info("Your ride has started");
      } else if (data.status === "completed") {
        toast.success("Your ride has been completed!");
      } else if (data.status === "cancelled") {
        toast.error("Your ride has been cancelled");
      }
    });

    // Listen for driver location updates
    socketRef.current.on("driverLocationUpdate", (location) => {
      setDriverLocation(location);
    });

    // Listen for nearby drivers
    socketRef.current.on("nearbyDrivers", (drivers) => {
      setNearbyDrivers(drivers);
    });

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Join user room when user is available
  useEffect(() => {
    if (user && socketRef.current) {
      socketRef.current.emit("joinUserRoom", { userId: user._id });
    }
  }, [user]);

  // Initialize Google Maps services
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    placesServiceRef.current = new window.google.maps.places.PlacesService(map);
    setMapLoaded(true);
  }, []);

  // Get user's current location
  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(currentLocation);
          setPickupLocation(currentLocation);

          // Get address from coordinates
          if (window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { location: currentLocation },
              (results, status) => {
                setIsLoading(false);
                if (status === "OK" && results[0]) {
                  setPickupLocationName(results[0].formatted_address);
                  // Clear any previous errors
                  setFormErrors((prev) => ({
                    ...prev,
                    pickup: undefined,
                    pickupCoords: undefined,
                  }));

                  // Emit location to socket for nearby drivers
                  if (socketRef.current) {
                    socketRef.current.emit("userLocation", currentLocation);
                  }
                } else {
                  toast.error(
                    "Could not determine your current location address"
                  );
                }
              }
            );
          } else {
            setIsLoading(false);
            toast.error("Google Maps not loaded yet. Please try again.");
          }
        },
        (error) => {
          setIsLoading(false);
          toast.error(`Error getting your location: ${error.message}`);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  }, []);

  // Initialize pickup and dropoff autocomplete
  useEffect(() => {
    if (
      mapLoaded &&
      window.google &&
      pickupInputRef.current &&
      dropoffInputRef.current
    ) {
      // Clean up previous autocomplete instances
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
      pickupAutocompleteRef.current =
        new window.google.maps.places.Autocomplete(pickupInputRef.current);
      dropoffAutocompleteRef.current =
        new window.google.maps.places.Autocomplete(dropoffInputRef.current);

      // Add listeners for place changes
      const pickupListener = pickupAutocompleteRef.current.addListener(
        "place_changed",
        () => {
          const place = pickupAutocompleteRef.current.getPlace();
          if (place && place.geometry && place.geometry.location) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            setPickupLocation(location);
            setPickupLocationName(place.formatted_address || place.name);
            setMapCenter(location);

            // Clear any previous errors
            setFormErrors((prev) => ({
              ...prev,
              pickup: undefined,
              pickupCoords: undefined,
            }));

            if (dropoffLocation) {
              calculateRoute(location, dropoffLocation);
            }

            // Emit location to socket for nearby drivers
            if (socketRef.current) {
              socketRef.current.emit("userLocation", location);
            }
          }
        }
      );

      const dropoffListener = dropoffAutocompleteRef.current.addListener(
        "place_changed",
        () => {
          const place = dropoffAutocompleteRef.current.getPlace();
          if (place && place.geometry && place.geometry.location) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            setDropoffLocation(location);
            setDropoffLocationName(place.formatted_address || place.name);

            // Clear any previous errors
            setFormErrors((prev) => ({
              ...prev,
              dropoff: undefined,
              dropoffCoords: undefined,
            }));

            if (pickupLocation) {
              calculateRoute(pickupLocation, location);
            }
          }
        }
      );

      // Return cleanup function
      return () => {
        if (window.google) {
          window.google.maps.event.removeListener(pickupListener);
          window.google.maps.event.removeListener(dropoffListener);
        }
      };
    }
  }, [mapLoaded, pickupLocation, dropoffLocation]);

  // Handle manual input changes
  const handlePickupInputChange = (e) => {
    setPickupLocationName(e.target.value);
    // Reset pickup location if user is typing a new address
    if (pickupLocationName !== e.target.value) {
      setPickupLocation(null);
    }
  };

  const handleDropoffInputChange = (e) => {
    setDropoffLocationName(e.target.value);
    // Reset dropoff location if user is typing a new address
    if (dropoffLocationName !== e.target.value) {
      setDropoffLocation(null);
    }
  };

  // Calculate route between pickup and dropoff
  const calculateRoute = useCallback(
    (origin, destination) => {
      if (!directionsServiceRef.current || !origin || !destination) {
        toast.error("Cannot calculate route. Please try again.");
        return;
      }

      setIsLoading(true);

      directionsServiceRef.current.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          setIsLoading(false);

          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);

            // Calculate distance and time
            const route = result.routes[0];
            let totalDistance = 0;
            let totalDuration = 0;

            route.legs.forEach((leg) => {
              totalDistance += leg.distance.value;
              totalDuration += leg.duration.value;
            });

            // Convert to km and minutes
            const distanceInKm = totalDistance / 1000;
            const durationInMinutes = Math.ceil(totalDuration / 60);

            setDistance(distanceInKm);
            setEstimatedTime(durationInMinutes);

            // Calculate fare based on vehicle type and distance
            calculateFare(distanceInKm, vehicleType);

            // Show summary after route calculation
            setShowSummary(true);

            // Emit route details to socket
            if (socketRef.current) {
              socketRef.current.emit("routeCalculated", {
                origin,
                destination,
                distance: distanceInKm,
                duration: durationInMinutes,
              });
            }
          } else {
            toast.error(`Directions request failed: ${status}`);
          }
        }
      );
    },
    [vehicleType]
  );

  // Calculate fare based on distance and vehicle type
  const calculateFare = useCallback((distance, type) => {
    let baseFare = 0;
    let ratePerKm = 0;

    switch (type) {
      case "Bike":
        baseFare = 50; // NPR
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
        baseFare = 100; // Default to Car
        ratePerKm = 30;
    }

    const calculatedFare = Math.round(baseFare + distance * ratePerKm);
    setFare(calculatedFare);
  }, []);

  // Manual location search
  const searchLocations = () => {
    // Validate inputs before searching
    const validation = validateForm(
      null,
      null,
      pickupLocationName,
      dropoffLocationName
    );

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      Object.values(validation.errors).forEach((error) => {
        toast.error(error);
      });
      return;
    }

    setIsLoading(true);

    // Search for pickup location
    const pickupRequest = {
      query: pickupLocationName,
      fields: ["name", "geometry", "formatted_address"],
    };

    placesServiceRef.current.findPlaceFromQuery(
      pickupRequest,
      (pickupResults, pickupStatus) => {
        if (
          pickupStatus === window.google.maps.places.PlacesServiceStatus.OK &&
          pickupResults[0]
        ) {
          const pickupPlace = pickupResults[0];
          const pickupLoc = {
            lat: pickupPlace.geometry.location.lat(),
            lng: pickupPlace.geometry.location.lng(),
          };
          setPickupLocation(pickupLoc);
          setPickupLocationName(
            pickupPlace.formatted_address || pickupPlace.name
          );

          // Search for dropoff location
          const dropoffRequest = {
            query: dropoffLocationName,
            fields: ["name", "geometry", "formatted_address"],
          };

          placesServiceRef.current.findPlaceFromQuery(
            dropoffRequest,
            (dropoffResults, dropoffStatus) => {
              setIsLoading(false);

              if (
                dropoffStatus ===
                  window.google.maps.places.PlacesServiceStatus.OK &&
                dropoffResults[0]
              ) {
                const dropoffPlace = dropoffResults[0];
                const dropoffLoc = {
                  lat: dropoffPlace.geometry.location.lat(),
                  lng: dropoffPlace.geometry.location.lng(),
                };
                setDropoffLocation(dropoffLoc);
                setDropoffLocationName(
                  dropoffPlace.formatted_address || dropoffPlace.name
                );

                // Calculate route
                calculateRoute(pickupLoc, dropoffLoc);
              } else {
                setFormErrors({
                  ...formErrors,
                  dropoff: `Could not find dropoff location: ${dropoffStatus}`,
                });
                toast.error(
                  `Could not find dropoff location: ${dropoffStatus}`
                );
              }
            }
          );
        } else {
          setIsLoading(false);
          setFormErrors({
            ...formErrors,
            pickup: `Could not find pickup location: ${pickupStatus}`,
          });
          toast.error(`Could not find pickup location: ${pickupStatus}`);
        }
      }
    );
  };

  // Request a ride
  const handleRequestRide = useCallback(() => {
    if (!user) {
      toast.error("Please log in to request a ride");
      navigate("/login");
      return;
    }

    // Validate before submitting
    const validation = validateForm(
      pickupLocation,
      dropoffLocation,
      pickupLocationName,
      dropoffLocationName
    );

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      Object.values(validation.errors).forEach((error) => {
        toast.error(error);
      });
      return;
    }

    setIsSubmitting(true);

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
      paymentMethod: "cash", // Default payment method
    };

    // Emit ride request to socket
    if (socketRef.current) {
      socketRef.current.emit("requestRide", rideData);
    }

    dispatch(requestRide(rideData))
      .unwrap()
      .then((response) => {
        toast.success("Ride requested successfully!");

        // Show detailed success message with ride details
        toast.success(
          <div>
            <p className="font-bold">Ride Requested!</p>
            <p>From: {pickupLocationName.substring(0, 30)}...</p>
            <p>To: {dropoffLocationName.substring(0, 30)}...</p>
            <p>Vehicle: {vehicleType}</p>
            <p>Fare: NPR {fare}</p>
          </div>,
          {
            duration: 5000,
          }
        );

        navigate("/ridestatus"); // Navigate to ride status page
      })
      .catch((error) => {
        // Handle specific error cases
        if (
          error.status === 400 &&
          error.details &&
          error.details.message === "Passenger already has an active ride"
        ) {
          toast.error(
            <div>
              <p className="font-bold">You already have an active ride</p>
              <p>
                Please complete or cancel your current ride before requesting a
                new one.
              </p>
              <button
                onClick={() => navigate("/ridestatus")}
                className="mt-2 px-4 py-1 bg-primary text-white rounded-md"
              >
                View Active Ride
              </button>
            </div>,
            {
              duration: 8000,
            }
          );
        } else {
          const errorMessage = error?.message || "Unknown error";
          toast.error(`Error requesting ride: ${errorMessage}`);

          // Show detailed error message
          toast.error(
            <div>
              <p className="font-bold">Ride Request Failed</p>
              <p>{errorMessage}</p>
              <p>Please try again or contact support.</p>
            </div>,
            {
              duration: 5000,
            }
          );
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [
    dispatch,
    user,
    pickupLocation,
    dropoffLocation,
    pickupLocationName,
    dropoffLocationName,
    vehicleType,
    distance,
    estimatedTime,
    fare,
    navigate,
    formErrors,
  ]);

  // Render vehicle type selection
  const renderVehicleTypeSelection = () => {
    return (
      <div className="grid grid-cols-3 gap-3">
        <button
          className={`p-3 rounded-lg border flex flex-col items-center ${
            vehicleType === "Bike"
              ? "border-primary bg-primary/10"
              : "border-gray-200"
          }`}
          onClick={() => {
            setVehicleType("Bike");
            calculateFare(distance, "Bike");
          }}
        >
          <FaMotorcycle
            size={24}
            className={
              vehicleType === "Bike" ? "text-primary" : "text-gray-500"
            }
          />
          <span className="mt-2 font-medium">Bike</span>
          <span className="text-sm text-gray-500">
            NPR {Math.round(50 + distance * 15)}
          </span>
        </button>
        <button
          className={`p-3 rounded-lg border flex flex-col items-center ${
            vehicleType === "Car"
              ? "border-primary bg-primary/10"
              : "border-gray-200"
          }`}
          onClick={() => {
            setVehicleType("Car");
            calculateFare(distance, "Car");
          }}
        >
          <FaCar
            size={24}
            className={vehicleType === "Car" ? "text-primary" : "text-gray-500"}
          />
          <span className="mt-2 font-medium">Car</span>
          <span className="text-sm text-gray-500">
            NPR {Math.round(100 + distance * 30)}
          </span>
        </button>
        <button
          className={`p-3 rounded-lg border flex flex-col items-center ${
            vehicleType === "Electric"
              ? "border-primary bg-primary/10"
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
              vehicleType === "Electric" ? "text-primary" : "text-gray-500"
            }
          />
          <span className="mt-2 font-medium">Electric</span>
          <span className="text-sm text-gray-500">
            NPR {Math.round(80 + distance * 25)}
          </span>
        </button>
      </div>
    );
  };

  // Render nearby drivers on the map
  const renderNearbyDrivers = () => {
    if (!nearbyDrivers || nearbyDrivers.length === 0) return null;

    return nearbyDrivers.map((driver, index) => (
      <Marker
        key={`driver-${index}`}
        position={{
          lat: driver.location.latitude,
          lng: driver.location.longitude,
        }}
        icon={{
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          scaledSize: new window.google.maps.Size(30, 30),
        }}
        title={`${driver.vehicleType} - ${driver.name}`}
      />
    ));
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Book a Ride</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4">
            <div className="mb-6">
              <LoadScript
                googleMapsApiKey={
                  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
                }
                libraries={libraries}
                onLoad={() => console.log("Google Maps script loaded")}
                onError={(error) => {
                  console.error("Error loading Google Maps:", error);
                  toast.error(`Failed to load Google Maps: ${error.message}`);
                }}
              >
                <div className="mb-4">
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

                    {/* Render driver's location if available */}
                    {driverLocation && (
                      <Marker
                        position={{
                          lat: driverLocation.latitude,
                          lng: driverLocation.longitude,
                        }}
                        icon={{
                          url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                          scaledSize: new window.google.maps.Size(40, 40),
                        }}
                        title="Your Driver"
                      />
                    )}

                    {/* Render nearby drivers */}
                    {renderNearbyDrivers()}

                    {directions && (
                      <DirectionsRenderer directions={directions} />
                    )}
                  </GoogleMap>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaMapMarkerAlt className="text-green-500" />
                      </div>
                      <input
                        ref={pickupInputRef}
                        type="text"
                        placeholder="From (pickup location)"
                        className={`w-full pl-10 pr-4 py-3 border ${
                          formErrors.pickup || formErrors.pickupCoords
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-primary"
                        } rounded-lg focus:outline-none focus:ring-2`}
                        value={pickupLocationName}
                        onChange={handlePickupInputChange}
                        required
                      />
                    </div>
                    <button
                      className="ml-2 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                      onClick={getCurrentLocation}
                      title="Use current location"
                      type="button"
                    >
                      <MdMyLocation size={20} className="text-primary" />
                    </button>
                  </div>
                  {(formErrors.pickup || formErrors.pickupCoords) && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.pickup || formErrors.pickupCoords}
                    </p>
                  )}

                  <div className="flex items-center">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaLocationArrow className="text-red-500" />
                      </div>
                      <input
                        ref={dropoffInputRef}
                        type="text"
                        placeholder="To (destination)"
                        className={`w-full pl-10 pr-4 py-3 border ${
                          formErrors.dropoff || formErrors.dropoffCoords
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-primary"
                        } rounded-lg focus:outline-none focus:ring-2`}
                        value={dropoffLocationName}
                        onChange={handleDropoffInputChange}
                        required
                      />
                    </div>
                  </div>
                  {(formErrors.dropoff || formErrors.dropoffCoords) && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.dropoff || formErrors.dropoffCoords}
                    </p>
                  )}
                </div>
              </LoadScript>
            </div>

            {/* Ride status notification */}
            {rideStatus && (
              <div
                className={`p-3 rounded-lg mb-4 ${
                  rideStatus === "accepted" ||
                  rideStatus === "arrived" ||
                  rideStatus === "started"
                    ? "bg-green-100 text-green-800"
                    : rideStatus === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                <p className="font-medium">Ride Status: {rideStatus}</p>
                {driverLocation && (
                  <p className="text-sm">
                    Driver is {Math.round(distance * 1000)} meters away
                  </p>
                )}
              </div>
            )}

            {/* Ride summary */}
            {showSummary && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-2">Ride Summary</h3>
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

            {/* Action buttons */}
            <div className="flex justify-between">
              {!showSummary ? (
                <button
                  className="w-full py-3 bg-primary text-white rounded-lg flex items-center justify-center"
                  onClick={() => {
                    // Validate form before proceeding
                    const validation = validateForm(
                      pickupLocation,
                      dropoffLocation,
                      pickupLocationName,
                      dropoffLocationName
                    );

                    if (!validation.isValid) {
                      setFormErrors(validation.errors);
                      Object.values(validation.errors).forEach((error) => {
                        toast.error(error);
                      });
                      return;
                    }

                    if (pickupLocation && dropoffLocation) {
                      calculateRoute(pickupLocation, dropoffLocation);
                    } else if (!pickupLocationName && !dropoffLocationName) {
                      toast.error("Please enter pickup and dropoff locations");
                    } else if (!pickupLocationName) {
                      toast.error("Please enter pickup location");
                    } else if (!dropoffLocationName) {
                      toast.error("Please enter dropoff location");
                    } else {
                      // Try to search for locations manually if input is present but locations aren't set
                      searchLocations();
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span>Find Ride</span>
                      <FaArrowRight className="ml-2" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  className="w-full py-3 bg-primary text-white rounded-lg font-medium"
                  onClick={handleRequestRide}
                  disabled={loading.requestRide || isSubmitting}
                >
                  {loading?.requestRide || isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      <span>Requesting...</span>
                    </div>
                  ) : (
                    "Request Ride"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle type selection (simplified) */}
        {showSummary && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="font-medium mb-3">Change Vehicle Type</h3>
            {renderVehicleTypeSelection()}
          </div>
        )}

        {/* Nearby drivers section */}
        {nearbyDrivers && nearbyDrivers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="font-medium mb-3">
              Nearby Drivers ({nearbyDrivers.length})
            </h3>
            <div className="space-y-2">
              {nearbyDrivers.map((driver, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 border rounded-lg"
                >
                  {driver.vehicleType === "Car" ? (
                    <FaCar className="text-primary mr-2" />
                  ) : driver.vehicleType === "Bike" ? (
                    <FaMotorcycle className="text-primary mr-2" />
                  ) : (
                    <FaBolt className="text-primary mr-2" />
                  )}
                  <div>
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-sm text-gray-500">
                      {driver.vehicleType} • {driver.rating} ★
                    </p>
                  </div>
                  <p className="ml-auto text-sm">
                    {Math.round(driver.distance * 1000)}m away
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SimpleRideBooking;
