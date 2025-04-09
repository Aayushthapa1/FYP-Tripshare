import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getPendingRides,
  updateRideStatus,
  getActiveRide,
} from "../Slices/rideSlice";
import { Toaster, toast } from "sonner";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import {
  MapPin,
  Clock,
  Car,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader,
  Navigation,
  PhoneCall,
  MessageSquare,
  ArrowRight,
  DollarSign,
  RefreshCw,
  CheckSquare,
  Shield,
  ArrowLeft,
  SendHorizontal,
  Image as ImageIcon,
  Info,
  Bike,
} from "lucide-react";
import socketService from "../socket/socketService";
import { useSocket } from "../../components/socket/SocketProvider";
import MapContainer from "./MapContainer";
import ImprovedMapSection from "./MapSection";
import FixedChatComponent from "../../components/FixedChatComponent";

// Ride Notification Component
const RideNotification = ({ request, onAccept, onDecline, isAccepting }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm border-l-4 border-blue-500 animate-in slide-in-from-right">
      <div className="flex justify-between">
        <h4 className="font-medium text-gray-800 flex items-center text-sm">
          <MapPin className="w-4 h-4 mr-1 text-blue-500" />
          New Ride Request
        </h4>
        <button
          onClick={onDecline}
          className="text-gray-400 hover:text-gray-600"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-2 text-sm">
        <div className="flex items-center mb-1">
          <MapPin className="w-3 h-3 text-blue-500 mr-1 flex-shrink-0" />
          <span className="text-gray-600 truncate">
            {request.pickupLocationName || "Pickup location"}
          </span>
        </div>
        <div className="flex items-center mb-1">
          <Navigation className="w-3 h-3 text-red-500 mr-1 flex-shrink-0" />
          <span className="text-gray-600 truncate">
            {request.dropoffLocationName || "Dropoff location"}
          </span>
        </div>
        <div className="flex items-center mb-1">
          <DollarSign className="w-3 h-3 text-green-500 mr-1 flex-shrink-0" />
          <span className="text-gray-600">
            NPR {request.fare || "0"}
            {request.distance && (
              <span className="text-xs text-gray-500 ml-1">
                ({request.distance.toFixed(1)} km)
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onAccept(request)}
          disabled={isAccepting}
          className={`flex-1 py-2 text-sm font-medium rounded-lg ${
            isAccepting
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isAccepting ? (
            <div className="flex items-center justify-center">
              <Loader className="w-3 h-3 mr-1 animate-spin" />
              Accepting...
            </div>
          ) : (
            "Accept"
          )}
        </button>
        <button
          onClick={onDecline}
          className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Decline
        </button>
      </div>
    </div>
  );
};

// Main Driver Ride Status Component
const ImprovedDriverRideStatus = () => {
  const dispatch = useDispatch();
  const { connected } = useSocket();

  // Redux state
  const { pendingRides, activeRide, loading } = useSelector(
    (state) => state.ride
  );
  const { user } = useSelector((state) => state.auth) || {};

  // Local state
  const [socketConnected, setSocketConnected] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRide, setSelectedRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 27.7172, lng: 85.324 }); // Default to Kathmandu
  const [refreshing, setRefreshing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isAcceptingRide, setIsAcceptingRide] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [incomingRideRequests, setIncomingRideRequests] = useState([]);

  // Refs
  const messagesEndRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Effect to sync socket connection state
  useEffect(() => {
    setSocketConnected(connected);
  }, [connected]);

  // Socket setup with error handling
  useEffect(() => {
    if (!socketService.connected) {
      socketService.connect();
    }

    const handleConnect = () => {
      console.log("Socket connected in DriverRideStatus");
      setSocketConnected(true);

      // Set driver as available
      if (user && user.role === "driver") {
        socketService.socket.emit("driver_available", {
          driverId: user._id,
          vehicleType: user.vehicleType || "Car",
          location: driverLocation,
        });
      }

      // Join active ride room if exists
      if (activeRide && activeRide._id) {
        socketService.joinRideRoom(activeRide._id);
      }
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected in DriverRideStatus");
      setSocketConnected(false);
    };

    const handleNewRideRequest = (data) => {
      console.log("New ride request received:", data);

      // Add to incoming requests state if not already there
      setIncomingRideRequests((prev) => {
        // Don't add duplicates
        if (prev.some((req) => req.rideId === data.rideId)) {
          return prev;
        }
        return [...prev, data];
      });

      // Show toast notification with action button
      toast.info("New ride request received!", {
        duration: 5000,
        action: {
          label: "View",
          onClick: () => {
            // Find the ride in pending rides or refresh to get it
            const ride = pendingRides.find((r) => r._id === data.rideId);
            if (ride) {
              setSelectedRide(ride);
              const pickupLoc = {
                lat: parseFloat(ride.pickupLocation.latitude),
                lng: parseFloat(ride.pickupLocation.longitude),
              };
              setMapCenter(pickupLoc);
            } else {
              dispatch(getPendingRides());
            }
          },
        },
      });

      // Refresh pending rides
      if (user && user._id) {
        dispatch(getPendingRides());
      }
    };

    const handleRideStatusUpdated = (data) => {
      console.log("Ride status updated:", data);

      if (data.newStatus === "canceled") {
        toast.error(
          `Ride canceled: ${data.cancelReason || "No reason provided"}`
        );
      } else if (data.newStatus === "completed") {
        toast.success("Ride completed successfully!");
      }

      // Refresh ride data
      if (user && user._id) {
        if (activeRide && activeRide._id) {
          dispatch(getActiveRide({ userId: user._id, userType: "driver" }));
        } else {
          dispatch(getPendingRides());
        }
      }
    };

    // Set up event listeners
    socketService.socket.on("connect", handleConnect);
    socketService.socket.on("disconnect", handleDisconnect);
    socketService.socket.on("new_ride_request", handleNewRideRequest);
    socketService.socket.on("driver_ride_request", handleNewRideRequest); // Listen for both event types
    socketService.socket.on("ride_status_updated", handleRideStatusUpdated);

    // Set initial connection status
    setSocketConnected(socketService.connected);

    return () => {
      socketService.socket.off("connect", handleConnect);
      socketService.socket.off("disconnect", handleDisconnect);
      socketService.socket.off("new_ride_request", handleNewRideRequest);
      socketService.socket.off("driver_ride_request", handleNewRideRequest);
      socketService.socket.off("ride_status_updated", handleRideStatusUpdated);

      // Leave active ride room if exists
      if (activeRide && activeRide._id) {
        socketService.leaveRideRoom(activeRide._id);
      }

      // Clear refresh timer if running
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [activeRide, user, dispatch, driverLocation, pendingRides, connected]);

  // Get driver's location and set up real-time tracking
  useEffect(() => {
    let watchId = null;

    // Only start location tracking if we have an active ride
    if (activeRide && ["accepted", "picked up"].includes(activeRide.status)) {
      if (navigator.geolocation) {
        // Use high accuracy watchPosition instead of getCurrentPosition for real-time updates
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            // Only update if position actually changed
            if (
              !driverLocation ||
              driverLocation.lat !== newLocation.lat ||
              driverLocation.lng !== newLocation.lng
            ) {
              setDriverLocation(newLocation);
              setMapCenter(newLocation);

              // Calculate and set ETA
              const eta = calculateETA(newLocation);
              setEstimatedArrival(eta);

              // Send location update through socket
              if (socketService.connected && activeRide.passengerId) {
                socketService.updateDriverLocation({
                  rideId: activeRide._id,
                  driverId: user._id,
                  passengerId:
                    typeof activeRide.passengerId === "object"
                      ? activeRide.passengerId._id
                      : activeRide.passengerId,
                  location: newLocation,
                  estimatedArrival: eta,
                });
              }
            }
          },
          (error) => {
            console.error("Error tracking position:", error);
            toast.error(
              "Unable to track your location. Please check your GPS settings."
            );
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000, // 10 seconds
            timeout: 10000, // 10 seconds
          }
        );
      } else {
        toast.error("Geolocation is not supported by your browser");
      }
    } else {
      // If no active ride, just get current location once
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setDriverLocation(newLocation);
            setMapCenter(newLocation);
          },
          (error) => {
            console.error("Error getting location:", error);
            toast.error(
              "Unable to get your location. Please check your settings."
            );
          }
        );
      }
    }

    // Clean up watch on unmount or if ride status changes
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [activeRide, user]);

  // Fetch pending rides and active ride when component mounts
  useEffect(() => {
    if (user && user._id) {
      dispatch(getPendingRides());
      dispatch(getActiveRide({ userId: user._id, userType: "driver" }));
    }
  }, [user, dispatch]);

  // Set up refresh interval for pending rides
  useEffect(() => {
    let interval;

    // Only refresh pending rides if there's no active ride
    if (!activeRide || !["accepted", "picked up"].includes(activeRide.status)) {
      interval = setInterval(() => {
        if (user && user._id) {
          dispatch(getPendingRides());
        }
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeRide, user, dispatch]);

  // Accept ride handler
  const handleAcceptRide = async (ride) => {
    if (!driverLocation) {
      toast.error(
        "Unable to get your location. Please enable location services."
      );
      return;
    }

    // Set accepting state to prevent multiple clicks
    setIsAcceptingRide(true);

    try {
      const payload = {
        rideId: ride._id,
        status: "accepted",
        driverId: user._id,
      };

      const result = await dispatch(updateRideStatus(payload)).unwrap();

      if (result.success) {
        // Calculate ETA
        const estimatedArrival = calculateETA(driverLocation, {
          lat: parseFloat(ride.pickupLocation.latitude),
          lng: parseFloat(ride.pickupLocation.longitude),
        });

        // Emit socket event to notify passenger
        if (socketService.connected) {
          // Use the acceptRide method
          socketService.acceptRide({
            rideId: ride._id,
            driverId: user._id,
            driverName: user.fullName || user.username,
            passengerId: ride.passengerId,
            estimatedArrival,
            driverLocation,
          });

          // Join ride room for real-time updates
          socketService.joinRideRoom(ride._id);
        }

        // Remove from incoming requests list
        setIncomingRideRequests((prev) =>
          prev.filter((req) => req.rideId !== ride._id)
        );

        toast.success("Ride accepted successfully!");

        // Immediately update the UI to show the active ride section
        setSelectedRide(null);

        // Refresh active ride
        dispatch(getActiveRide({ userId: user._id, userType: "driver" }))
          .unwrap()
          .then((response) => {
            // Force UI update when we get the active ride
            if (response.success && response.data) {
              // Make sure we're showing the accepted ride status UI
              const activeRideData = response.data;
              // Join ride room for real-time updates
              if (socketService.connected) {
                socketService.joinRideRoom(activeRideData._id);
              }
            }
          });
      } else {
        toast.error(result.message || "Failed to accept ride");
      }
    } catch (err) {
      toast.error(`Error accepting ride: ${err.message || err}`);
    } finally {
      setIsAcceptingRide(false);
    }
  };

  // Handler for accepting ride from notification
  const handleAcceptNotification = async (rideData) => {
    setIsAcceptingRide(true);

    try {
      // Create a payload for the Redux action
      const payload = {
        rideId: rideData.rideId,
        status: "accepted",
        driverId: user._id,
      };

      // Update ride status in the database
      const result = await dispatch(updateRideStatus(payload)).unwrap();

      if (result.success) {
        // Calculate ETA
        const estimatedArrival = calculateETA(driverLocation, {
          lat: parseFloat(rideData.pickupLocation?.lat || 0),
          lng: parseFloat(rideData.pickupLocation?.lng || 0),
        });

        // Emit socket event to notify passenger
        if (socketService.connected) {
          // Use the acceptRide method
          socketService.acceptRide({
            rideId: rideData.rideId,
            driverId: user._id,
            driverName: user.fullName || user.username,
            passengerId: rideData.passengerId,
            estimatedArrival,
            driverLocation,
          });

          // Join the ride room
          socketService.joinRideRoom(rideData.rideId);
        }

        toast.success("Ride accepted successfully!");

        // Clear selected ride if any
        setSelectedRide(null);

        // Remove from incoming requests list
        setIncomingRideRequests((prev) =>
          prev.filter((req) => req.rideId !== rideData.rideId)
        );

        // Refresh active ride to update UI
        dispatch(getActiveRide({ userId: user._id, userType: "driver" }));
      } else {
        toast.error(result.message || "Failed to accept ride");
      }
    } catch (err) {
      toast.error(`Error accepting ride: ${err.message || err}`);
    } finally {
      setIsAcceptingRide(false);
    }
  };

  // Reject ride handler
  const handleRejectRide = async () => {
    if (!selectedRide) return;

    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      const payload = {
        rideId: selectedRide._id,
        status: "rejected",
        cancelReason: rejectReason,
      };

      const result = await dispatch(updateRideStatus(payload)).unwrap();

      if (result.success) {
        // Emit socket event to notify passenger
        if (socketService.connected) {
          socketService.updateRideStatus({
            rideId: selectedRide._id,
            previousStatus: selectedRide.status,
            newStatus: "rejected",
            passengerId: selectedRide.passengerId,
            driverId: user._id,
            cancelReason: rejectReason,
            updatedBy: "driver",
          });
        }

        // Remove from incoming requests list
        setIncomingRideRequests((prev) =>
          prev.filter((req) => req.rideId !== selectedRide._id)
        );

        toast.success("Ride rejected");
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedRide(null);

        // Refresh pending rides
        dispatch(getPendingRides());
      } else {
        toast.error(result.message || "Failed to reject ride");
      }
    } catch (err) {
      toast.error(`Error rejecting ride: ${err.message || err}`);
    }
  };

  // Update ride status handler (for ongoing rides)
  const handleUpdateRideStatus = async (newStatus) => {
    if (!activeRide) return;

    // Set updating state to prevent multiple clicks
    setIsUpdatingStatus(true);

    try {
      const payload = {
        rideId: activeRide._id,
        status: newStatus,
      };

      const result = await dispatch(updateRideStatus(payload)).unwrap();

      if (result.success) {
        // Emit socket event
        if (socketService.connected) {
          socketService.updateRideStatus({
            rideId: activeRide._id,
            previousStatus: activeRide.status,
            newStatus,
            passengerId:
              typeof activeRide.passengerId === "object"
                ? activeRide.passengerId._id
                : activeRide.passengerId,
            driverId: user._id,
            updatedBy: "driver",
          });
        }

        toast.success(
          `Ride ${
            newStatus === "picked up" ? "started" : "completed"
          } successfully!`
        );

        // Refresh active ride and force UI update
        dispatch(getActiveRide({ userId: user._id, userType: "driver" }))
          .unwrap()
          .then((response) => {
            // Force UI update based on new status
            if (response.success && response.data) {
              // If ride is completed, clear any intervals or timers
              if (newStatus === "completed") {
                setTimeout(() => {
                  // Refresh pending rides after a slight delay
                  dispatch(getPendingRides());
                }, 2000);
              }
            }
          });
      } else {
        toast.error(
          result.message || `Failed to update ride status to ${newStatus}`
        );
      }
    } catch (err) {
      toast.error(`Error updating ride status: ${err.message || err}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Calculate ETA between driver and pickup/dropoff location
  const calculateETA = (currentLocation, destinationLocation = null) => {
    // Use pickup location if no destination provided and we have an active ride
    if (!destinationLocation && activeRide?.pickupLocation) {
      destinationLocation = {
        lat: parseFloat(activeRide.pickupLocation.latitude),
        lng: parseFloat(activeRide.pickupLocation.longitude),
      };
    }

    // If no valid locations, return default
    if (!currentLocation || !destinationLocation) return "15 mins";

    // Calculate distance using Haversine formula
    const R = 6371e3; // Earth radius in meters
    const φ1 = (currentLocation.lat * Math.PI) / 180;
    const φ2 = (destinationLocation.lat * Math.PI) / 180;
    const Δφ =
      ((destinationLocation.lat - currentLocation.lat) * Math.PI) / 180;
    const Δλ =
      ((destinationLocation.lng - currentLocation.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // in meters

    // Calculate estimated time (assuming average speed of 30 km/h in city)
    // Adjust speed based on time of day, vehicle type, etc. for better accuracy
    let speed = 30; // km/h

    // If vehicle type is bike, use different speed estimate
    if (user?.vehicleType === "Bike") {
      speed = 25; // km/h for bikes in city traffic
    }

    const timeInMinutes = Math.ceil(distance / ((speed * 1000) / 60));

    if (timeInMinutes < 1) return "Less than 1 min";
    if (timeInMinutes === 1) return "1 min";
    if (timeInMinutes < 20) return `${timeInMinutes} mins`;

    return "20+ mins";
  };

  // Format location data to be more user-friendly
  const formatLocation = (location) => {
    if (!location) return "Not specified";

    // If it's a string, return it directly
    if (typeof location === "string") return location;

    // If it has a name, return that
    if (location.name) return location.name;

    // If it has latitude and longitude
    if (location.latitude && location.longitude) {
      // Return formatted coordinates
      return `${Number.parseFloat(location.latitude).toFixed(
        6
      )}, ${Number.parseFloat(location.longitude).toFixed(6)}`;
    }

    return "Location details unavailable";
  };

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshing(true);

    const refreshPromises = [];

    if (user && user._id) {
      if (activeRide && activeRide._id) {
        refreshPromises.push(
          dispatch(getActiveRide({ userId: user._id, userType: "driver" }))
        );
      } else {
        refreshPromises.push(dispatch(getPendingRides()));
      }
    }

    // Get current location
    if (navigator.geolocation) {
      const locationPromise = new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setDriverLocation(loc);
            setMapCenter(loc);
            resolve();
          },
          (error) => {
            console.error("Error getting location:", error);
            reject(error);
          }
        );
      });

      refreshPromises.push(locationPromise);
    }

    // Wait for all refreshes to complete
    Promise.all(refreshPromises)
      .then(() => {
        // Add small delay to show refresh animation
        refreshTimerRef.current = setTimeout(() => {
          setRefreshing(false);
        }, 1000);
      })
      .catch(() => {
        setRefreshing(false);
      });
  };

  // Toggle the chat view
  const toggleChat = () => {
    setShowChat(!showChat);
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
              {typeof activeRide.passengerId === "object"
                ? activeRide.passengerId.fullName || "Passenger"
                : "Passenger"}
            </h2>
            <p className="text-xs text-blue-100">
              {activeRide.vehicleType || "Car"} • Ride #
              {activeRide._id.substring(0, 6)}
            </p>
          </div>
          {typeof activeRide.passengerId === "object" &&
            (activeRide.passengerId.phone ||
              activeRide.passengerId.phoneNumber) && (
              <a
                href={`tel:${
                  activeRide.passengerId.phone ||
                  activeRide.passengerId.phoneNumber
                }`}
                className="bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-colors"
              >
                <PhoneCall className="w-5 h-5 text-white" />
              </a>
            )}
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          <FixedChatComponent
            rideId={activeRide._id}
            recipientId={
              typeof activeRide.passengerId === "object"
                ? activeRide.passengerId._id
                : activeRide.passengerId
            }
            userId={user?._id}
            userName={user?.fullName || user?.username || "Driver"}
          />
        </div>
      </div>
    );
  };

  // Display incoming ride request notifications
  const renderIncomingRequests = () => {
    if (incomingRideRequests.length === 0) return null;

    return (
      <div className="fixed bottom-4 right-4 z-30 flex flex-col-reverse gap-2">
        {incomingRideRequests.map((request) => (
          <RideNotification
            key={request.rideId}
            request={request}
            onAccept={handleAcceptNotification}
            onDecline={() => {
              setIncomingRideRequests((prev) =>
                prev.filter((req) => req.rideId !== request.rideId)
              );
            }}
            isAccepting={isAcceptingRide}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <Toaster richColors position="top-center" />

      {/* Chat Interface */}
      {renderChatInterface()}

      {/* Incoming ride requests */}
      {renderIncomingRequests()}

      <div className="bg-gray-50 min-h-screen pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header with socket status */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Driver Dashboard</h1>
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center text-sm ${
                  socketConnected ? "text-green-600" : "text-red-500"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    socketConnected
                      ? "bg-green-600 animate-pulse"
                      : "bg-red-500"
                  }`}
                ></div>
                <span>{socketConnected ? "Connected" : "Offline"}</span>
              </div>

              <button
                onClick={handleRefresh}
                className={`flex items-center text-blue-600 text-sm font-medium bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors ${
                  refreshing ? "cursor-not-allowed opacity-70" : ""
                }`}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1.5 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <h2 className="font-medium mb-3 flex items-center">
              <MapPin className="mr-2 text-blue-500" />
              Live Map
            </h2>
            <div className="h-64 md:h-72 rounded-lg overflow-hidden border border-gray-100">
              <MapContainer>
                <ImprovedMapSection
                  pickupLocation={
                    activeRide?.pickupLocation
                      ? {
                          lat: parseFloat(activeRide.pickupLocation.latitude),
                          lng: parseFloat(activeRide.pickupLocation.longitude),
                        }
                      : null
                  }
                  dropoffLocation={
                    activeRide?.dropoffLocation
                      ? {
                          lat: parseFloat(activeRide.dropoffLocation.latitude),
                          lng: parseFloat(activeRide.dropoffLocation.longitude),
                        }
                      : null
                  }
                  directions={directions}
                  mapCenter={mapCenter}
                  driverLocation={driverLocation}
                  driverInfo={{
                    name: user?.fullName || user?.username,
                    vehicleType: user?.vehicleType || "Car",
                    licensePlate: user?.licensePlate || user?.numberPlate,
                  }}
                  isRideAccepted={
                    activeRide &&
                    ["accepted", "picked up"].includes(activeRide.status)
                  }
                  estimatedArrival={estimatedArrival}
                  vehicleType={user?.vehicleType || "Car"}
                />
              </MapContainer>
            </div>
          </div>

          {/* Driver Location Status */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="text-blue-500 mr-2" />
                <h2 className="font-medium">Your Current Location</h2>
              </div>
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const loc = {
                          lat: position.coords.latitude,
                          lng: position.coords.longitude,
                        };
                        setDriverLocation(loc);
                        setMapCenter(loc);
                        toast.success("Location updated");
                      },
                      (error) => {
                        toast.error(`Error getting location: ${error.message}`);
                      }
                    );
                  }
                }}
                className="text-blue-500 hover:text-blue-700 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Update
              </button>
            </div>

            <div className="mt-2">
              {driverLocation ? (
                <p className="text-gray-700">
                  Lat: {driverLocation.lat.toFixed(6)}, Lng:{" "}
                  {driverLocation.lng.toFixed(6)}
                </p>
              ) : (
                <p className="text-yellow-600">
                  Location not available. Please enable location services.
                </p>
              )}
            </div>
          </div>

          {/* Active Ride Section */}
          {activeRide &&
            (activeRide.status === "accepted" ||
              activeRide.status === "picked up") && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-5">
                  <h2 className="font-bold text-xl flex items-center">
                    <Car className="mr-2" />
                    {activeRide.status === "accepted"
                      ? "Ongoing Ride - Go Pick Up Passenger"
                      : "Ride in Progress - Heading to Destination"}
                  </h2>
                </div>

                <div className="p-5">
                  {/* Status Indicator */}
                  <div className="flex items-center justify-center mb-5">
                    <div className="flex items-center bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          activeRide.status === "accepted"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      ></div>
                      <span className="font-medium">
                        {activeRide.status === "accepted"
                          ? "Waiting for Pickup"
                          : "In Progress"}
                      </span>
                    </div>
                  </div>

                  {/* Passenger Details */}
                  <div className="mb-5 border-b border-gray-100 pb-5">
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                      <User className="w-5 h-5 mr-2 text-blue-500" />
                      Passenger
                    </h3>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-lg">
                          {activeRide.passengerId?.fullName ||
                            activeRide.passengerId?.username ||
                            "Passenger"}
                        </p>
                        {activeRide.passengerId?.phoneNumber && (
                          <p className="text-sm text-gray-500">
                            {activeRide.passengerId.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ride Details */}
                  <div className="space-y-3 mb-5 border-b border-gray-100 pb-5">
                    <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-500" />
                      Ride Details
                    </h3>

                    {/* Pickup */}
                    <div className="flex items-start">
                      <div className="bg-green-100 p-2 rounded-lg mt-1">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-gray-500">Pickup</p>
                        <p className="font-medium">
                          {activeRide.pickupLocationName ||
                            formatLocation(activeRide.pickupLocation)}
                        </p>
                      </div>
                    </div>

                    {/* Dropoff */}
                    <div className="flex items-start">
                      <div className="bg-red-100 p-2 rounded-lg mt-1">
                        <Navigation className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-gray-500">Dropoff</p>
                        <p className="font-medium">
                          {activeRide.dropoffLocationName ||
                            formatLocation(activeRide.dropoffLocation)}
                        </p>
                      </div>
                    </div>

                    {/* Distance and Fare */}
                    <div className="flex items-start">
                      <div className="bg-green-100 p-2 rounded-lg mt-1">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-xs text-gray-500">Fare</p>
                        <p className="font-medium">
                          NPR {activeRide.fare}
                          {activeRide.distance && (
                            <span className="text-gray-500 text-sm ml-2">
                              ({activeRide.distance?.toFixed(1) || "0"} km)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* ETA */}
                    {estimatedArrival && (
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mt-1">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-xs text-gray-500">
                            {activeRide.status === "accepted"
                              ? "Estimated Arrival at Pickup"
                              : "Estimated Arrival at Destination"}
                          </p>
                          <p className="font-medium">{estimatedArrival}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    {/* Contact Options */}
                    <div className="grid grid-cols-2 gap-3">
                      {activeRide.passengerId?.phone && (
                        <a
                          href={`tel:${activeRide.passengerId.phone}`}
                          className="flex items-center justify-center py-3 bg-white rounded-xl border border-gray-200 hover:bg-blue-500 hover:text-white transition-colors shadow-sm"
                        >
                          <PhoneCall className="w-5 h-5 mr-2" />
                          <span className="font-medium">Call Passenger</span>
                        </a>
                      )}

                      <button
                        onClick={toggleChat}
                        className="flex items-center justify-center py-3 bg-white rounded-xl border border-gray-200 hover:bg-blue-500 hover:text-white transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        <span className="font-medium">Message</span>
                      </button>
                    </div>

                    {/* Status Update Button */}
                    <div>
                      {activeRide.status === "accepted" ? (
                        <button
                          onClick={() => handleUpdateRideStatus("picked up")}
                          disabled={isUpdatingStatus}
                          className={`w-full bg-blue-600 text-white py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-md ${
                            isUpdatingStatus
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {isUpdatingStatus ? (
                            <span className="flex items-center justify-center">
                              <Loader className="animate-spin w-5 h-5 mr-2" />
                              Updating...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 mr-2" />
                              Start Ride (Passenger Picked Up)
                            </span>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateRideStatus("completed")}
                          disabled={isUpdatingStatus}
                          className={`w-full bg-green-600 text-white py-4 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-md ${
                            isUpdatingStatus
                              ? "opacity-70 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {isUpdatingStatus ? (
                            <span className="flex items-center justify-center">
                              <Loader className="animate-spin w-5 h-5 mr-2" />
                              Completing...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              <CheckSquare className="w-5 h-5 mr-2" />
                              Complete Ride (Arrived at Destination)
                            </span>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Safety Tip */}
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start">
                      <Shield className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-sm text-gray-600">
                        Remember to drive safely and follow traffic rules.
                        {activeRide.status === "accepted"
                          ? " Verify passenger identity before starting the ride."
                          : " Ensure passenger comfort throughout the journey."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Pending Rides Section */}
          {(!activeRide ||
            !["accepted", "picked up"].includes(activeRide.status)) && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-5">
                <h2 className="font-bold text-xl flex items-center">
                  <Clock className="mr-2" /> Available Ride Requests
                </h2>
              </div>

              <div className="p-5">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">
                      Looking for ride requests...
                    </p>
                  </div>
                )}

                {!loading && (!pendingRides || pendingRides.length === 0) && (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Car className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No pending ride requests
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      No ride requests at the moment. New requests will appear
                      here automatically. Check back soon or take a break!
                    </p>
                    <button
                      onClick={handleRefresh}
                      className="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-full flex items-center mx-auto"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Requests
                    </button>
                  </div>
                )}

                {!loading && pendingRides && pendingRides.length > 0 && (
                  <div className="divide-y">
                    {pendingRides.map((ride) => (
                      <div key={ride._id} className="py-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium flex items-center">
                            <Clock className="w-5 h-5 text-blue-500 mr-2" />
                            New Ride Request
                          </h3>
                          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                            {new Date(ride.createdAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="space-y-3 mb-4">
                          {/* Pickup */}
                          <div className="flex items-start">
                            <div className="mt-1 bg-green-100 p-2 rounded-lg">
                              <MapPin className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-xs text-gray-500">Pickup</p>
                              <p className="font-medium">
                                {ride.pickupLocationName ||
                                  formatLocation(ride.pickupLocation)}
                              </p>
                            </div>
                          </div>

                          {/* Dropoff */}
                          <div className="flex items-start">
                            <div className="mt-1 bg-red-100 p-2 rounded-lg">
                              <Navigation className="w-4 h-4 text-red-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-xs text-gray-500">Dropoff</p>
                              <p className="font-medium">
                                {ride.dropoffLocationName ||
                                  formatLocation(ride.dropoffLocation)}
                              </p>
                            </div>
                          </div>

                          {/* Distance and Fare */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center bg-gray-50 p-2 rounded-lg">
                              {ride.vehicleType?.toLowerCase() === "bike" ? (
                                <Bike className="w-4 h-4 text-gray-500 mr-2" />
                              ) : (
                                <Car className="w-4 h-4 text-gray-500 mr-2" />
                              )}
                              <span className="text-sm font-medium">
                                {ride.vehicleType || "Car"}
                              </span>
                            </div>
                            <div className="flex items-center bg-green-50 p-2 rounded-lg">
                              <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                              <span className="text-sm font-medium">
                                NPR {ride.fare || "0"}
                              </span>
                            </div>
                            <div className="flex items-center bg-blue-50 p-2 rounded-lg">
                              <ArrowRight className="w-4 h-4 text-blue-600 mr-2" />
                              <span className="text-sm font-medium">
                                {ride.distance?.toFixed(1) || "0"} km
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => handleAcceptRide(ride)}
                            disabled={isAcceptingRide}
                            className={`w-full py-3 rounded-lg font-medium text-sm ${
                              isAcceptingRide
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            } transition-colors shadow-sm`}
                          >
                            {isAcceptingRide ? (
                              <span className="flex items-center justify-center">
                                <Loader className="animate-spin w-4 h-4 mr-2" />
                                Accepting...
                              </span>
                            ) : (
                              "Accept Ride"
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRide(ride);
                              setShowRejectModal(true);
                            }}
                            className="w-1/3 bg-gray-200 text-gray-800 py-3 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors shadow-sm"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Ride Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-in fade-in duration-300">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Decline Ride Request
                </h2>
              </div>

              <p className="text-gray-600 mb-5">
                Please provide a reason for declining this ride request:
              </p>

              <div className="mb-5">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for declining..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows="3"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                  className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectRide}
                  className="px-5 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium"
                >
                  Decline Ride
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

export default ImprovedDriverRideStatus;
