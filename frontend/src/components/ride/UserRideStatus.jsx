import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getActiveRide, updateRideStatus } from "../Slices/rideSlice";
import { Toaster, toast } from "sonner";
import {
  MapPin,
  Clock,
  Car,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader,
  Phone,
  Navigation,
  Star,
  MessageSquare,
  DollarSign,
  Bike,
  RefreshCw,
  CheckSquare,
  Shield,
  Info,
  SendHorizontal,
  ArrowLeft,
  Menu,
  Home,
  UserCircle,
  History,
  Settings,
  LogOut,
  PenSquare,
  Image as ImageIcon,
} from "lucide-react";
import socketService from "../socket/socketService";
import { useSocket } from "../../components/socket/SocketProvider";
import Navbar from "../layout/Navbar";

// Import Map components
import MapContainer from "./MapContainer";
import EnhancedMapSection from "./MapSection";
import FixedChatComponent from "../../components/FixedChatComponent";

const RideStatus = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { connected } = useSocket();

  // Redux state
  const { activeRide, loading, error } = useSelector((state) => state.ride);
  const { user } = useSelector((state) => state.auth) || {};

  // Local state for UI
  const [socketConnected, setSocketConnected] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [driverOnRoute, setDriverOnRoute] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [rideTimer, setRideTimer] = useState(0);
  const [directions, setDirections] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [activeStep, setActiveStep] = useState(1); // 1: Requested, 2: Accepted, 3: Picked Up, 4: Completed
  const [mapCenter, setMapCenter] = useState({ lat: 27.7172, lng: 85.324 }); // Default to Kathmandu
  const [rideStatus, setRideStatus] = useState("requested");
  const [isRideAccepted, setIsRideAccepted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [driverInfo, setDriverInfo] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [manualRefreshing, setManualRefreshing] = useState(false);

  // Refs
  const timerRef = useRef(null);
  const mapRef = useRef(null);
  const chatContainerRef = useRef(null);
  const refreshTimerRef = useRef(null);

  // Effect to sync socket connection state
  useEffect(() => {
    setSocketConnected(connected);
  }, [connected]);

  // Effect for socket connection and event handling
  useEffect(() => {
    if (!socketService.connected) {
      socketService.connect();
    }

    const handleConnect = () => {
      console.log("Socket connected in RideStatus");
      setSocketConnected(true);

      // Join ride room if we have an active ride
      if (activeRide && activeRide._id) {
        socketService.joinRideRoom(activeRide._id);
      }
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected in RideStatus");
      setSocketConnected(false);
    };

    const handleDriverAccepted = (data) => {
      console.log("A driver accepted your ride:", data);
      toast.success(
        `${data.driverName || "A driver"} has accepted your ride request!`,
        { duration: 5000 }
      );

      // Update ride status and step
      setRideStatus("accepted");
      setActiveStep(2); // Move to Accepted step
      setIsRideAccepted(true);

      // Update state with driver info
      setEstimatedArrival(data.estimatedArrival || "10-15 minutes");
      setDriverOnRoute(true);

      // Set driver location if available
      if (data.driverLocation) {
        setDriverLocation(data.driverLocation);
        setMapCenter(data.driverLocation);
      }

      // Set driver info
      if (data.driverId) {
        setDriverInfo({
          id: data.driverId,
          name: data.driverName || "Your Driver",
          phone: data.driverPhone,
          vehicleType: data.vehicleType || "Car",
          licensePlate: data.licensePlate || "",
          rating: data.rating || 4.5,
        });
      }

      // Force immediate refresh of ride data to get driver details
      if (user && user._id) {
        dispatch(getActiveRide({ userId: user._id, userType: "passenger" }));
      }
    };

    const handleRideStatusUpdated = (data) => {
      console.log("Ride status updated:", data);

      // Update ride status
      setRideStatus(data.newStatus);

      // Update UI based on new status
      if (data.newStatus === "picked up") {
        toast.success("Your driver has arrived at your pickup location!");
        setActiveStep(3); // Move to Picked Up step

        // Start ride timer
        if (timerRef.current) clearInterval(timerRef.current);
        setRideTimer(0);
        timerRef.current = setInterval(() => {
          setRideTimer((prev) => prev + 1);
        }, 1000);
      } else if (data.newStatus === "completed") {
        toast.success("Your ride has been completed!");
        setActiveStep(4); // Move to Completed step

        // Stop ride timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else if (data.newStatus === "canceled") {
        toast.error(
          `Ride canceled: ${data.cancelReason || "No reason provided"}`
        );

        // Stop timer if running
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }

      // Refresh ride data
      if (user && user._id) {
        dispatch(getActiveRide({ userId: user._id, userType: "passenger" }));
      }
    };

    const handleDriverLocationUpdated = (data) => {
      console.log("Driver location updated:", data);

      if (data.location) {
        setDriverLocation(data.location);
        // Only center the map on driver if we're in "accepted" status
        if (rideStatus === "accepted") {
          setMapCenter(data.location);
        }
      }

      if (data.estimatedArrival) {
        setEstimatedArrival(data.estimatedArrival);
      }
    };

    // Set up event listeners
    socketService.socket.on("connect", handleConnect);
    socketService.socket.on("disconnect", handleDisconnect);
    socketService.socket.on("driver_accepted", handleDriverAccepted);
    socketService.socket.on("ride_status_changed", handleRideStatusUpdated);
    socketService.socket.on(
      "driver_location_changed",
      handleDriverLocationUpdated
    );

    // Set initial connection status
    setSocketConnected(socketService.connected);

    // Join ride room if we already have an active ride
    if (socketService.connected && activeRide && activeRide._id) {
      socketService.joinRideRoom(activeRide._id);
    }

    // Clean up on unmount
    return () => {
      socketService.socket.off("connect", handleConnect);
      socketService.socket.off("disconnect", handleDisconnect);
      socketService.socket.off("driver_accepted", handleDriverAccepted);
      socketService.socket.off("ride_status_changed", handleRideStatusUpdated);
      socketService.socket.off(
        "driver_location_changed",
        handleDriverLocationUpdated
      );

      // Leave ride room on unmount
      if (activeRide && activeRide._id) {
        socketService.leaveRideRoom(activeRide._id);
      }

      // Clear timer if running
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Clear refresh timer if running
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [activeRide, user, dispatch, rideStatus, connected]);

  // Fetch ride data when component mounts
  useEffect(() => {
    if (user && user._id) {
      dispatch(getActiveRide({ userId: user._id, userType: "passenger" }));
    }
  }, [user, dispatch]);

  // Set up refresh interval for active rides
  useEffect(() => {
    let interval;

    if (
      activeRide &&
      ["requested", "accepted", "picked up"].includes(activeRide.status)
    ) {
      interval = setInterval(() => {
        if (user && user._id) {
          dispatch(getActiveRide({ userId: user._id, userType: "passenger" }));
        }
      }, 15000); // Refresh every 15 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeRide, user, dispatch]);

  // Update local ride status and active step based on ride status from redux
  useEffect(() => {
    if (!activeRide) return;

    // Override even if socket hasn't updated yet
    if (activeRide.driverId && activeRide.status === "requested") {
      // If we have a driver but state says requested, override to accepted
      setIsRideAccepted(true);
      setRideStatus("accepted");
      setActiveStep(2);
      setDriverOnRoute(true);
    } else {
      // Update ride status from backend
      setRideStatus(activeRide.status);

      // Update active step and other UI flags
      switch (activeRide.status) {
        case "requested":
          setActiveStep(1);
          setIsRideAccepted(false);
          break;
        case "accepted":
          setActiveStep(2);
          setDriverOnRoute(true);
          setIsRideAccepted(true);
          break;
        case "picked up":
          setActiveStep(3);
          setIsRideAccepted(true);
          break;
        case "completed":
          setActiveStep(4);
          setIsRideAccepted(true);
          break;
        default:
          setActiveStep(1);
          setIsRideAccepted(false);
      }
    }

    // Set driver info from backend if available
    if (activeRide.driverId) {
      const driverData =
        typeof activeRide.driverId === "object"
          ? activeRide.driverId
          : { _id: activeRide.driverId };

      // Extract driver info from active ride
      setDriverInfo({
        id:
          typeof activeRide.driverId === "object"
            ? activeRide.driverId._id
            : activeRide.driverId,
        name: driverData.fullName || driverData.username || "Driver",
        phone: driverData.phone || driverData.phoneNumber,
        vehicleType: driverData.vehicleType || activeRide.vehicleType || "Car",
        licensePlate: driverData.numberPlate || "",
        rating: driverData.rating || 4.5,
      });

      // Set pickup and dropoff locations for map
      if (activeRide.pickupLocation) {
        const pickupLoc = {
          lat: Number.parseFloat(activeRide.pickupLocation.latitude),
          lng: Number.parseFloat(activeRide.pickupLocation.longitude),
        };

        // If no driver location yet, center map on pickup
        if (!driverLocation) {
          setMapCenter(pickupLoc);
        }
      }

      // Set driver location if available from backend
      if (driverData.currentLocation) {
        const driverLoc = {
          lat: Number.parseFloat(driverData.currentLocation.latitude),
          lng: Number.parseFloat(driverData.currentLocation.longitude),
        };
        setDriverLocation(driverLoc);

        // Center on driver location if in accepted status
        if (activeRide.status === "accepted" || rideStatus === "accepted") {
          setMapCenter(driverLoc);
        }
      }
    }
  }, [activeRide, driverLocation]);

  // Calculate and fetch directions when pickup/dropoff locations change
  useEffect(() => {
    if (!activeRide || !window.google || !window.google.maps) return;

    const fetchDirections = async () => {
      if (!activeRide.pickupLocation || !activeRide.dropoffLocation) return;

      try {
        const directionsService = new window.google.maps.DirectionsService();

        const result = await new Promise((resolve, reject) => {
          directionsService.route(
            {
              origin: {
                lat: Number.parseFloat(activeRide.pickupLocation.latitude),
                lng: Number.parseFloat(activeRide.pickupLocation.longitude),
              },
              destination: {
                lat: Number.parseFloat(activeRide.dropoffLocation.latitude),
                lng: Number.parseFloat(activeRide.dropoffLocation.longitude),
              },
              travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (response, status) => {
              if (status === "OK") {
                resolve(response);
              } else {
                reject(new Error(`Directions request failed: ${status}`));
              }
            }
          );
        });

        setDirections(result);

        // Extract route details
        if (result.routes && result.routes[0]) {
          const route = result.routes[0];
          const leg = route.legs[0];

          setRouteDetails({
            distance: leg.distance.text,
            duration: leg.duration.text,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            steps: leg.steps,
          });
        }
      } catch (error) {
        console.error("Error fetching directions:", error);
      }
    };

    fetchDirections();
  }, [activeRide]);

  // Format ride time into MM:SS
  const formatRideTime = useCallback(() => {
    const minutes = Math.floor(rideTimer / 60);
    const seconds = rideTimer % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }, [rideTimer]);

  // Manual refresh function
  const handleRefresh = () => {
    setManualRefreshing(true);

    if (user && user._id) {
      dispatch(getActiveRide({ userId: user._id, userType: "passenger" }))
        .then(() => {
          // Add small delay to show refresh animation
          refreshTimerRef.current = setTimeout(() => {
            setManualRefreshing(false);
          }, 1000);
        })
        .catch(() => {
          setManualRefreshing(false);
        });
    } else {
      setManualRefreshing(false);
    }
  };

  // Cancel ride handler
  const handleCancelRide = async () => {
    if (!activeRide) return;

    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      const payload = {
        rideId: activeRide._id,
        status: "canceled",
        cancelReason: cancelReason,
      };

      const result = await dispatch(updateRideStatus(payload)).unwrap();

      if (result.success) {
        // Also emit through socket for real-time update
        if (socketService.connected) {
          socketService.updateRideStatus({
            rideId: activeRide._id,
            previousStatus: activeRide.status,
            newStatus: "canceled",
            passengerId: user._id,
            driverId: activeRide.driverId?._id,
            cancelReason,
            updatedBy: "passenger",
          });
        }

        toast.success("Ride canceled successfully.");
        setShowCancelConfirm(false);
        setCancelReason("");
      } else {
        toast.error(result.message || "Failed to cancel ride");
      }
    } catch (err) {
      toast.error(`Cancel ride error: ${err}`);
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
      const lat = Number.parseFloat(location.latitude).toFixed(6);
      const lng = Number.parseFloat(location.longitude).toFixed(6);
      return `${lat}, ${lng}`;
    }

    return "Location details unavailable";
  };

  // Get status details
  const getStatusDetails = () => {
    if (!activeRide) return {};

    const statusMap = {
      requested: {
        icon: <Clock className="w-6 h-6 text-blue-500" />,
        color: "blue",
        title: "Ride Requested",
        description: "Waiting for a driver to accept your ride request...",
        progress: 25,
      },
      accepted: {
        icon: <CheckCircle className="w-6 h-6 text-green-500" />,
        color: "green",
        title: "Driver On The Way",
        description:
          "A driver has accepted your ride and is on the way to pick you up!",
        progress: 50,
      },
      "picked up": {
        icon: <Car className="w-6 h-6 text-yellow-500" />,
        color: "yellow",
        title: "On The Way",
        description: "You're currently on your ride. Enjoy the journey!",
        progress: 75,
      },
      completed: {
        icon: <CheckSquare className="w-6 h-6 text-green-500" />,
        color: "green",
        title: "Ride Completed",
        description:
          "Your ride has been completed successfully. Thank you for riding with us!",
        progress: 100,
      },
      canceled: {
        icon: <XCircle className="w-6 h-6 text-red-500" />,
        color: "red",
        title: "Ride Canceled",
        description: activeRide.cancelReason || "This ride was canceled.",
        progress: 100,
      },
      rejected: {
        icon: <XCircle className="w-6 h-6 text-red-500" />,
        color: "red",
        title: "Ride Rejected",
        description: "Unfortunately, your ride request was rejected.",
        progress: 100,
      },
    };

    // Override with local state if needed (important for accepted state)
    const status =
      isRideAccepted && activeRide.status === "requested"
        ? "accepted"
        : rideStatus;

    return (
      statusMap[status] || {
        icon: <AlertTriangle className="w-6 h-6 text-gray-500" />,
        color: "gray",
        title: "Unknown Status",
        description: "The status of this ride is unknown.",
        progress: 0,
      }
    );
  };

  // Toggle the chat view
  const toggleChat = () => {
    setShowChat(!showChat);
  };

  // Render map with driver location
  const renderMap = () => {
    if (!activeRide) return null;

    const pickupLoc = activeRide.pickupLocation
      ? {
          lat: Number.parseFloat(activeRide.pickupLocation.latitude),
          lng: Number.parseFloat(activeRide.pickupLocation.longitude),
        }
      : null;

    const dropoffLoc = activeRide.dropoffLocation
      ? {
          lat: Number.parseFloat(activeRide.dropoffLocation.latitude),
          lng: Number.parseFloat(activeRide.dropoffLocation.longitude),
        }
      : null;

    const status =
      isRideAccepted && activeRide.status === "requested"
        ? "accepted"
        : rideStatus;

    // Determine vehicle type with fallbacks
    let vehicleType = "Car";
    if (activeRide.driverId && typeof activeRide.driverId === "object") {
      vehicleType =
        activeRide.driverId.vehicleType || activeRide.vehicleType || "Car";
    } else if (driverInfo) {
      vehicleType = driverInfo.vehicleType || "Car";
    } else {
      vehicleType = activeRide.vehicleType || "Car";
    }

    // Use the enhanced map component with correct props
    return (
      <div className="h-72 md:h-80 rounded-2xl overflow-hidden shadow-lg mb-6 border border-gray-100">
        <MapContainer>
          <EnhancedMapSection
            pickupLocation={pickupLoc}
            dropoffLocation={dropoffLoc}
            directions={directions}
            onMapLoad={(map) => {
              mapRef.current = map;
            }}
            mapCenter={mapCenter}
            driverLocation={driverLocation}
            driverInfo={driverInfo}
            isRideAccepted={
              isRideAccepted || status === "accepted" || status === "picked up"
            }
            estimatedArrival={estimatedArrival}
            rideStatus={status}
            vehicleType={vehicleType}
          />
        </MapContainer>
      </div>
    );
  };

  const statusDetails = getStatusDetails();

  // Track steps UI
  const renderStatusSteps = () => {
    // Override status for UI if needed
    const currentActiveStep =
      isRideAccepted && activeRide?.status === "requested" ? 2 : activeStep;

    return (
      <div className="flex items-center justify-between mb-8 px-2">
        {/* Step 1: Requested */}
        <div className="flex flex-col items-center relative z-10">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              currentActiveStep >= 1
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-400"
            } shadow-md transition-all duration-300`}
          >
            <Clock className="h-6 w-6" />
          </div>
          <span className="text-xs mt-2 font-medium">Requested</span>
        </div>

        {/* Line between 1-2 */}
        <div
          className={`h-1 flex-1 mx-1 relative z-0 ${
            currentActiveStep >= 2 ? "bg-blue-600" : "bg-gray-200"
          } transition-all duration-500`}
        ></div>

        {/* Step 2: Accepted */}
        <div className="flex flex-col items-center relative z-10">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              currentActiveStep >= 2
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-400"
            } shadow-md transition-all duration-300`}
          >
            <CheckCircle className="h-6 w-6" />
          </div>
          <span className="text-xs mt-2 font-medium">Accepted</span>
        </div>

        {/* Line between 2-3 */}
        <div
          className={`h-1 flex-1 mx-1 relative z-0 ${
            currentActiveStep >= 3 ? "bg-blue-600" : "bg-gray-200"
          } transition-all duration-500`}
        ></div>

        {/* Step 3: On the Way */}
        <div className="flex flex-col items-center relative z-10">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              currentActiveStep >= 3
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-400"
            } shadow-md transition-all duration-300`}
          >
            <Car className="h-6 w-6" />
          </div>
          <span className="text-xs mt-2 font-medium">On the Way</span>
        </div>

        {/* Line between 3-4 */}
        <div
          className={`h-1 flex-1 mx-1 relative z-0 ${
            currentActiveStep >= 4 ? "bg-blue-600" : "bg-gray-200"
          } transition-all duration-500`}
        ></div>

        {/* Step 4: Completed */}
        <div className="flex flex-col items-center relative z-10">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              currentActiveStep >= 4
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-400"
            } shadow-md transition-all duration-300`}
          >
            <Navigation className="h-6 w-6" />
          </div>
          <span className="text-xs mt-2 font-medium">Completed</span>
        </div>
      </div>
    );
  };

  // Chat component rendering
  const renderChatInterface = () => {
    if (!showChat || !activeRide) return null;

    return (
      <div
        className="fixed inset-0 z-40 bg-white flex flex-col"
        ref={chatContainerRef}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 flex items-center">
          <button
            onClick={toggleChat}
            className="mr-3 hover:bg-white hover:bg-opacity-10 p-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h2 className="font-semibold">
              {typeof activeRide.driverId === "object"
                ? activeRide.driverId.fullName || "Driver"
                : driverInfo?.name || "Driver"}
            </h2>
            <p className="text-xs text-blue-100">
              {activeRide.vehicleType || "Car"} •{" "}
              {typeof activeRide.driverId === "object"
                ? activeRide.driverId.numberPlate || ""
                : driverInfo?.licensePlate || ""}
            </p>
          </div>
          {typeof activeRide.driverId === "object" &&
            (activeRide.driverId.phone || activeRide.driverId.phoneNumber) && (
              <a
                href={`tel:${
                  activeRide.driverId.phone || activeRide.driverId.phoneNumber
                }`}
                className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-colors"
              >
                <Phone className="w-5 h-5 text-white" />
              </a>
            )}
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          <FixedChatComponent
            rideId={activeRide._id}
            recipientId={
              typeof activeRide.driverId === "object"
                ? activeRide.driverId._id
                : activeRide.driverId
            }
            userId={user?._id}
            userName={user?.fullName || "Passenger"}
          />
        </div>
      </div>
    );
  };

  // Mobile menu rendering
  const renderMobileMenu = () => {
    if (!isMobileMenuOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
        <div className="bg-white w-64 h-full p-5 flex flex-col animate-in slide-in-from-left">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-blue-600">TripShare</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <XCircle className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          <div className="flex flex-col space-y-1">
            <button className="flex items-center p-3 rounded-lg hover:bg-blue-50 text-gray-700 transition-colors">
              <Home className="w-5 h-5 mr-3" />
              <span className="font-medium">Home</span>
            </button>
            <button className="flex items-center p-3 rounded-lg hover:bg-blue-50 text-gray-700 transition-colors">
              <UserCircle className="w-5 h-5 mr-3" />
              <span className="font-medium">Profile</span>
            </button>
            <button className="flex items-center p-3 rounded-lg hover:bg-blue-50 text-gray-700 transition-colors">
              <History className="w-5 h-5 mr-3" />
              <span className="font-medium">Ride History</span>
            </button>
            <button className="flex items-center p-3 rounded-lg hover:bg-blue-50 text-gray-700 transition-colors">
              <Settings className="w-5 h-5 mr-3" />
              <span className="font-medium">Settings</span>
            </button>
          </div>

          <div className="mt-auto">
            <button className="flex items-center p-3 rounded-lg hover:bg-red-50 text-red-600 w-full transition-colors">
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        <div
          className="flex-1"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Toaster richColors position="top-center" />

      {/* Mobile Menu */}
      {renderMobileMenu()}

      {/* Chat Interface */}
      {renderChatInterface()}

      {/* Navigation Bar - Using the original Navbar component */}
      <Navbar />

      <div className="container mx-auto px-4 py-20 max-w-2xl">
        {/* Socket connection status */}
        <div className="mb-4 flex items-center justify-between">
          <div
            className={`text-sm flex items-center ${
              socketConnected ? "text-green-600" : "text-red-500"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                socketConnected ? "bg-green-600 animate-pulse" : "bg-red-500"
              }`}
            ></div>
            <span className="font-medium">
              {socketConnected ? "Live updates active" : "Offline mode"}
            </span>
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className={`flex items-center text-blue-600 text-sm font-medium bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors ${
              manualRefreshing ? "cursor-not-allowed opacity-70" : ""
            }`}
            disabled={manualRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1.5 ${
                manualRefreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        {/* Main content */}
        <div
          className={`${
            showChat ? "opacity-0 pointer-events-none" : "opacity-100"
          } transition-opacity duration-300`}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6">
              <h1 className="text-2xl font-bold flex items-center">
                <Car className="mr-2" /> Ride Status
              </h1>
              <p className="text-blue-100 mt-1">
                Track your current ride in real-time
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Loading State */}
              {loading && !activeRide && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">
                    Loading your ride information...
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-red-800">
                        Error Loading Ride
                      </h3>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                      <button
                        onClick={handleRefresh}
                        className="mt-2 text-red-600 font-medium text-sm hover:underline"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* No Active Ride */}
              {!loading && !error && !activeRide && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Car className="w-12 h-12 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                    No Active Rides
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                    You don't have any active rides at the moment. Ready to go
                    somewhere?
                  </p>
                  <button
                    onClick={() => navigate("/requestride")}
                    className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1"
                  >
                    Book a Ride
                  </button>
                </div>
              )}

              {/* Active Ride */}
              {!loading && activeRide && (
                <div>
                  {/* Status Steps Progress */}
                  {renderStatusSteps()}

                  {/* Map showing driver location */}
                  {renderMap()}

                  {/* Status Progress */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {statusDetails.icon}
                        <h2 className="text-xl font-semibold ml-2 text-gray-800">
                          {statusDetails.title}
                        </h2>
                      </div>
                      <span className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        {formatDate(activeRide.createdAt)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                      <div
                        className={`h-full transition-all duration-700 ease-out ${
                          statusDetails.color === "blue"
                            ? "bg-blue-500"
                            : statusDetails.color === "green"
                            ? "bg-green-500"
                            : statusDetails.color === "yellow"
                            ? "bg-yellow-500"
                            : statusDetails.color === "red"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                        style={{ width: `${statusDetails.progress}%` }}
                      ></div>
                    </div>

                    {/* Status Description */}
                    <p className="text-gray-600 mb-3 text-lg">
                      {statusDetails.description}
                    </p>

                    {/* Show ETA if available */}
                    {estimatedArrival &&
                      (isRideAccepted || rideStatus === "accepted") && (
                        <div className="mt-3 text-blue-600 font-medium flex items-center bg-blue-50 p-3 rounded-xl border border-blue-100">
                          <Clock className="w-5 h-5 mr-3" />
                          Driver arrival in: {estimatedArrival}
                        </div>
                      )}

                    {/* Show ride timer if in progress */}
                    {rideStatus === "picked up" && (
                      <div className="mt-3 text-yellow-600 font-medium flex items-center bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                        <Clock className="w-5 h-5 mr-3" />
                        Trip time: {formatRideTime()}
                      </div>
                    )}
                  </div>

                  {/* Ride Details */}
                  <div className="bg-white rounded-xl p-6 mb-6 shadow-md border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-5 flex items-center text-lg">
                      <Info className="w-5 h-5 mr-2 text-blue-500" />
                      Ride Details
                    </h3>

                    <div className="space-y-5">
                      {/* Pickup Location */}
                      <div className="flex items-start">
                        <div className="mt-1 bg-blue-100 p-2 rounded-lg">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-gray-500 font-medium">
                            Pickup Location
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatLocation(
                              activeRide.pickupLocationName ||
                                activeRide.pickupLocation
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Destination */}
                      <div className="flex items-start">
                        <div className="mt-1 bg-red-100 p-2 rounded-lg">
                          <Navigation className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-gray-500 font-medium">
                            Destination
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatLocation(
                              activeRide.dropoffLocationName ||
                                activeRide.dropoffLocation
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Vehicle Type */}
                      <div className="flex items-start">
                        <div className="mt-1 bg-gray-100 p-2 rounded-lg">
                          {activeRide.vehicleType?.toLowerCase() === "bike" ? (
                            <Bike className="w-5 h-5 text-gray-700" />
                          ) : (
                            <Car className="w-5 h-5 text-gray-700" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-gray-500 font-medium">
                            Vehicle Type
                          </p>
                          <p className="font-medium text-gray-900">
                            {activeRide.vehicleType || "Car"}
                          </p>
                        </div>
                      </div>

                      {/* Fare */}
                      {activeRide.fare && (
                        <div className="flex items-start">
                          <div className="mt-1 bg-green-100 p-2 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-xs text-gray-500 font-medium">
                              Estimated Fare
                            </p>
                            <p className="font-medium text-gray-900">
                              NPR {activeRide.fare}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Distance/Time if available */}
                      {routeDetails && (
                        <div className="flex items-start">
                          <div className="mt-1 bg-purple-100 p-2 rounded-lg">
                            <Clock className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-xs text-gray-500 font-medium">
                              Trip Details
                            </p>
                            <p className="font-medium text-gray-900">
                              {routeDetails.distance} • {routeDetails.duration}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Driver Details (if ride is accepted or picked up) */}
                  {((activeRide.driverId &&
                    (rideStatus === "accepted" ||
                      rideStatus === "picked up")) ||
                    (activeRide.driverId && isRideAccepted)) && (
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 mb-6 shadow-md border border-blue-100">
                      <h3 className="font-semibold text-gray-800 mb-5 flex items-center text-lg">
                        <User className="w-5 h-5 mr-2 text-blue-500" />
                        Driver Information
                      </h3>

                      <div className="flex items-center mb-6">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-2 border-blue-200 shadow-md">
                          {activeRide.driverId.profileImage ? (
                            <img
                              src={
                                activeRide.driverId.profileImage ||
                                "/placeholder.svg"
                              }
                              alt="Driver"
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-10 h-10 text-blue-500" />
                          )}
                        </div>
                        <div className="ml-5">
                          <p className="font-semibold text-gray-900 text-xl">
                            {typeof activeRide.driverId === "object"
                              ? activeRide.driverId.fullName ||
                                activeRide.driverId.userName
                              : driverInfo?.name || "Driver"}
                          </p>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i <
                                  (typeof activeRide.driverId === "object"
                                    ? activeRide.driverId.rating || 4
                                    : driverInfo?.rating || 4)
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-gray-600 font-medium">
                              (
                              {typeof activeRide.driverId === "object"
                                ? activeRide.driverId.rating || "4.0"
                                : driverInfo?.rating || "4.0"}
                              )
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Phone */}
                        {(typeof activeRide.driverId === "object"
                          ? activeRide.driverId.phone ||
                            activeRide.driverId.phoneNumber
                          : driverInfo?.phone) && (
                          <a
                            href={`tel:${
                              typeof activeRide.driverId === "object"
                                ? activeRide.driverId.phone ||
                                  activeRide.driverId.phoneNumber
                                : driverInfo?.phone
                            }`}
                            className="flex items-center justify-center py-3 bg-white rounded-xl border border-gray-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm"
                          >
                            <Phone className="w-5 h-5 mr-2" />
                            <span className="font-medium">Call Driver</span>
                          </a>
                        )}

                        {/* Message */}
                        <button
                          onClick={toggleChat}
                          className="flex items-center justify-center py-3 bg-white rounded-xl border border-gray-200 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm"
                        >
                          <MessageSquare className="w-5 h-5 mr-2" />
                          <span className="font-medium">Message</span>
                        </button>
                      </div>

                      {/* Vehicle Details */}
                      {(typeof activeRide.driverId === "object"
                        ? activeRide.driverId.vehicleType
                        : driverInfo?.vehicleType) && (
                        <div className="mt-5 pt-5 border-t border-blue-100">
                          <div className="flex items-start">
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                              {(typeof activeRide.driverId === "object"
                                ? activeRide.driverId.vehicleType
                                : driverInfo?.vehicleType
                              )?.toLowerCase() === "bike" ? (
                                <Bike className="w-6 h-6 text-blue-500" />
                              ) : (
                                <Car className="w-6 h-6 text-blue-500" />
                              )}
                            </div>
                            <div className="ml-4">
                              <p className="font-semibold text-gray-800 text-lg">
                                {typeof activeRide.driverId === "object"
                                  ? activeRide.driverId.vehicleType
                                  : driverInfo?.vehicleType || "Vehicle"}
                              </p>
                              {(typeof activeRide.driverId === "object"
                                ? activeRide.driverId.numberPlate
                                : driverInfo?.licensePlate) && (
                                <p className="text-sm text-gray-600 bg-white px-3 py-1 rounded-lg mt-2 inline-block shadow-sm border border-gray-100">
                                  License Plate:{" "}
                                  <span className="font-semibold">
                                    {typeof activeRide.driverId === "object"
                                      ? activeRide.driverId.numberPlate
                                      : driverInfo?.licensePlate}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Safety tip */}
                      <div className="mt-5 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start">
                        <Shield className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                        <p className="text-sm text-gray-600">
                          For your safety, please verify your driver's identity
                          and license plate before starting your trip
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-8">
                    {/* Show "Cancel Ride" if status is requested, accepted, or picked up */}
                    {(rideStatus === "requested" ||
                      rideStatus === "accepted" ||
                      rideStatus === "picked up" ||
                      isRideAccepted) && (
                      <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="w-full px-4 py-4 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center font-medium shadow-md"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        Cancel Ride
                      </button>
                    )}

                    {/* Show "Request New Ride" if status is completed, canceled, or rejected */}
                    {(rideStatus === "completed" ||
                      rideStatus === "canceled" ||
                      rideStatus === "rejected") && (
                      <button
                        onClick={() => navigate("/requestride")}
                        className="w-full px-4 py-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center font-medium shadow-md"
                      >
                        <Car className="w-5 h-5 mr-2" />
                        Request New Ride
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in fade-in duration-300">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Cancel Ride
                </h2>
              </div>

              <p className="text-gray-600 mb-5">
                Are you sure you want to cancel this ride? This action cannot be
                undone.
              </p>

              <div className="mb-5">
                <label
                  htmlFor="cancelReason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Reason for cancellation
                </label>
                <textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please provide a reason for cancellation..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows="3"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setCancelReason("");
                  }}
                  className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Go Back
                </button>
                <button
                  onClick={handleCancelRide}
                  className="px-5 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideStatus;
