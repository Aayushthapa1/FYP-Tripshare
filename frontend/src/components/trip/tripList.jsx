"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteTrip,
  updateTrip,
  getTrips,
  getTripById,
  searchTrips,
} from "../Slices/tripSlice";
import { fetchMyBookings, createBooking } from "../Slices/bookingSlice";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { initiatePayment } from "../Slices/paymentSlice";
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  User,
  Car,
  Check,
  X,
  Edit,
  Trash,
  Info,
  Home,
  ToggleLeft,
  ChevronRight,
  Plus,
  Save,
  Sliders,
  Search,
  Star,
  ChevronLeft,
  ChevronDown,
  Filter,
} from "lucide-react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import Pagination from "../../utils/Pagination.jsx";
import { useSearchParams } from "react-router-dom";

// Google Maps Component
const GoogleMapComponent = ({ trips, apiKey }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey]);

  const initMap = () => {
    if (!mapRef.current) return;

    // Default center (Nepal)
    const defaultCenter = { lat: 27.7172, lng: 85.324 };

    const newMap = new window.google.maps.Map(mapRef.current, {
      zoom: 7,
      center: defaultCenter,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    setMap(newMap);

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(userLocation);
          newMap.setCenter(userLocation);
          newMap.setZoom(10);

          // Add marker for user's location
          new window.google.maps.Marker({
            position: userLocation,
            map: newMap,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
            title: "Your Location",
          });
        },
        () => {
          // Handle geolocation error
          console.log("Error: The Geolocation service failed.");
        }
      );
    }
  };

  // Add markers for trips when trips or map changes
  useEffect(() => {
    if (!map || !trips.length) return;

    // Clear existing markers
    map.data.forEach((feature) => {
      map.data.remove(feature);
    });

    // Known city coordinates in Nepal
    const cityCoordinates = {
      Kathmandu: { lat: 27.7172, lng: 85.324 },
      Pokhara: { lat: 28.2096, lng: 83.9856 },
      Itahari: { lat: 26.6631, lng: 87.2773 },
      Biratnagar: { lat: 26.4525, lng: 87.2718 },
      Birgunj: { lat: 27.0104, lng: 84.877 },
      Dharan: { lat: 26.8065, lng: 87.2846 },
      Butwal: { lat: 27.7006, lng: 83.4482 },
      Nepalgunj: { lat: 28.05, lng: 81.6167 },
      Bhaktapur: { lat: 27.671, lng: 85.4298 },
      Lalitpur: { lat: 27.6588, lng: 85.3247 },
    };

    // Add markers for each trip
    trips.forEach((trip) => {
      // Check if we have coordinates for departure location
      if (cityCoordinates[trip.departureLocation]) {
        const marker = new window.google.maps.Marker({
          position: cityCoordinates[trip.departureLocation],
          map: map,
          title: `From: ${trip.departureLocation}`,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          },
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 200px;">
              <h3 style="margin: 0 0 5px; font-weight: bold;">${
                trip.departureLocation
              }</h3>
              <p style="margin: 0 0 5px;">To: ${trip.destinationLocation}</p>
              <p style="margin: 0 0 5px;">Date: ${formatDate(
                trip.departureDate
              )}</p>
              <p style="margin: 0;">Price: Rs${trip.price}</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      }

      // Check if we have coordinates for destination location
      if (cityCoordinates[trip.destinationLocation]) {
        const marker = new window.google.maps.Marker({
          position: cityCoordinates[trip.destinationLocation],
          map: map,
          title: `To: ${trip.destinationLocation}`,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          },
        });

        // Add info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 200px;">
              <h3 style="margin: 0 0 5px; font-weight: bold;">${
                trip.destinationLocation
              }</h3>
              <p style="margin: 0 0 5px;">From: ${trip.departureLocation}</p>
              <p style="margin: 0 0 5px;">Date: ${formatDate(
                trip.departureDate
              )}</p>
              <p style="margin: 0;">Price: Rs${trip.price}</p>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      }

      // Draw route line between departure and destination if both exist
      if (
        cityCoordinates[trip.departureLocation] &&
        cityCoordinates[trip.destinationLocation]
      ) {
        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#4285F4",
            strokeWeight: 4,
            strokeOpacity: 0.7,
          },
        });

        directionsService.route(
          {
            origin: cityCoordinates[trip.departureLocation],
            destination: cityCoordinates[trip.destinationLocation],
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (response, status) => {
            if (status === "OK") {
              directionsRenderer.setDirections(response);
            }
          }
        );
      }
    });
  }, [trips, map]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
};

// Import your existing Pagination component

const TripList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Auth user
  const { user } = useSelector((state) => state.auth) || {};

  const { trips = [], loading, error } = useSelector((state) => state.trip);
  const { myBookings = [] } = useSelector((state) => state.booking) || {};

  // State for modals
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [paymentModalTrip, setPaymentModalTrip] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // For filtering and search
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // For pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const tripsPerPage = 5;

  // For mobile view
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handlePaymentCompletion = async () => {
      try {
        const pidx = searchParams.get("pidx");
        const transaction_id = searchParams.get("transaction_id");
        const amount = searchParams.get("amount");
        const purchase_order_id = searchParams.get("purchase_order_id");

        if (pidx && transaction_id && amount && purchase_order_id) {
          const result = await dispatch(
            completePayment({ pidx, transaction_id, amount, purchase_order_id })
          ).unwrap();

          if (result.IsSuccess) {
            toast.success("Payment Successful", {
              description: "Your payment has been completed successfully.",
            });
            navigate("/payment-success", {
              state: { transactionDetails: result },
            });
          } else {
            throw new Error("Payment verification failed.");
          }
        }
      } catch (error) {
        toast.error("Payment Failed", {
          description: error.message || "Payment verification failed.",
        });
        navigate("/payment-failed");
      }
    };

    handlePaymentCompletion();
  }, [searchParams, dispatch, navigate]);

  useEffect(() => {
    dispatch(getTrips());
    dispatch(fetchMyBookings());

    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  // --- ACTION HANDLERS ---

  const handleDelete = async (tripId) => {
    try {
      await dispatch(deleteTrip(tripId)).unwrap();
      toast.success("Trip deleted successfully");
      dispatch(getTrips());
    } catch (err) {
      toast.error(err?.message || "Failed to delete trip");
    }
  };

  const handleStatusUpdate = async (tripId, currentStatus) => {
    try {
      const newStatus =
        currentStatus === "scheduled" ? "cancelled" : "scheduled";
      await dispatch(
        updateTrip({ tripId, tripData: { status: newStatus } })
      ).unwrap();
      toast.success(`Trip status updated to "${newStatus}"`);
      dispatch(getTrips());
    } catch (err) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  // "View Details" modal
  const handleViewDetails = (trip) => {
    setSelectedTrip(trip);
  };
  const closeDetailsModal = () => {
    setSelectedTrip(null);
  };

  // "Edit" modal
  const handleEditClick = async (trip) => {
    try {
      await dispatch(getTripById(trip._id)).unwrap();
      setEditingTrip(trip);
      setEditFormData({ ...trip });
    } catch (err) {
      toast.error("Failed to fetch trip details");
    }
  };
  const closeEditModal = () => {
    setEditingTrip(null);
    setEditFormData(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTrip || !editFormData) return;

    try {
      await dispatch(
        updateTrip({
          tripId: editingTrip._id,
          tripData: editFormData,
        })
      ).unwrap();
      toast.success("Trip updated successfully");
      closeEditModal();
      dispatch(getTrips());
    } catch (err) {
      toast.error(err?.message || "Failed to update trip");
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => {
      if (!prev) return prev;
      if (type === "checkbox") {
        return {
          ...prev,
          preferences: { ...prev.preferences, [name]: checked },
        };
      } else if (name.startsWith("vehicleDetails.")) {
        const field = name.split(".")[1];
        return {
          ...prev,
          vehicleDetails: {
            ...prev.vehicleDetails,
            [field]: value,
          },
        };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  // Booking function to show payment options
  const handleBooking = (trip) => {
    setPaymentModalTrip(trip);
  };

  // Function to close payment modal
  const closePaymentModal = () => {
    setPaymentModalTrip(null);
    setSelectedPaymentMethod("COD");
    setIsProcessingPayment(false);
  };

  // Function to process the actual booking with payment method
  const processBooking = async () => {
    try {
      setIsProcessingPayment(true);

      if (selectedPaymentMethod === "online") {
        try {
          // For online payments, initiate payment directly
          const paymentResponse = await dispatch(
            initiatePayment({
              userId: user._id,
              tripId: paymentModalTrip._id,
              seats: 1, // Assuming 1 seat by default
              amount: paymentModalTrip.price,
              bookingType: "trip",
            })
          ).unwrap();
          console.log("The payment response is", paymentResponse);

          if (paymentResponse?.Result?.payment_url) {
            window.location.href = paymentResponse.Result.payment_url;
          } else {
            throw new Error("No payment URL received");
          }
        } catch (err) {
          console.error("Payment initiation error:", err);
          toast.error("Payment Failed", {
            description: err?.message || "Failed to initiate payment",
          });
        }
      } else {
        // For COD, create the booking immediately
        const bookingData = {
          tripId: paymentModalTrip._id,
          seats: 1,
          paymentMethod: "COD",
        };

        const result = await dispatch(createBooking(bookingData)).unwrap();
        toast.success("Booking Confirmed", {
          description: "Your trip has been booked with Cash on Delivery!",
        });

        // Refresh trips to update availability
        dispatch(getTrips());
        dispatch(getMyBookings());
        closePaymentModal();
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Booking Failed", {
        description: err?.message || "Failed to book trip",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      dispatch(searchTrips(searchTerm));
      setCurrentPage(1);
    } else {
      dispatch(getTrips());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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

  // Get today's date without time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter trips
  const filteredTrips = trips.filter((trip) => {
    const tripDate = new Date(trip.departureDate);
    tripDate.setHours(0, 0, 0, 0);

    // Filter out trips with 0 available seats
    const hasAvailableSeats = trip.availableSeats > 0;

    // Filter out trips with past departure dates
    const isFutureTrip = tripDate >= today;

    // Filter by status
    const statusFilterMatch =
      statusFilter === "all" || trip.status === statusFilter;

    return hasAvailableSeats && isFutureTrip && statusFilterMatch;
  });

  // Pagination logic
  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);

  // Handle page change with loading state
  const handlePageChange = (pageNumber) => {
    setIsPaginationLoading(true);
    setCurrentPage(pageNumber);

    // Simulate loading for better UX
    setTimeout(() => {
      setIsPaginationLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading trips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Error Loading Trips
            </h2>
            <p className="text-center text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center"
            >
              <Home className="w-4 h-4 mr-2" /> Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-right" richColors />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Trip Listings
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Filter size={18} className="text-gray-700" />
              </button>
              <div className="hidden md:flex items-center bg-white border border-gray-300 rounded-full overflow-hidden">
                <input
                  type="text"
                  placeholder="Search trips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="px-4 py-2 text-sm border-none focus:outline-none w-64"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-green-500 text-white hover:bg-green-600"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className={`bg-white shadow-sm border-b border-gray-200 transition-all duration-300 ${
          showFilters ? "max-h-96" : "max-h-16"
        } md:max-h-none overflow-hidden`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center justify-between md:justify-start">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === "all"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("scheduled")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === "scheduled"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Scheduled
                </button>
                <button
                  onClick={() => setStatusFilter("cancelled")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === "cancelled"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Cancelled
                </button>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <ChevronDown
                  size={20}
                  className={`text-gray-500 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            <div className="md:hidden flex items-center bg-white border border-gray-300 rounded-full overflow-hidden mt-2">
              <input
                type="text"
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="px-4 py-2 text-sm border-none focus:outline-none flex-1"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-green-500 text-white hover:bg-green-600"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Trip List Section */}
          <div className="lg:w-1/2 space-y-4">
            {isPaginationLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : currentTrips.length > 0 ? (
              currentTrips.map((trip) => (
                <div
                  key={trip._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {/* Status Badge */}
                  <div className="relative">
                    <span
                      className={`absolute top-4 left-4 inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${
                        trip.status === "scheduled"
                          ? "bg-green-100 text-green-800"
                          : trip.status === "in-progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : trip.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {trip.status === "scheduled" && (
                        <Check size={12} className="mr-1" />
                      )}
                      {trip.status === "in-progress" && (
                        <Clock size={12} className="mr-1" />
                      )}
                      {trip.status === "completed" && (
                        <Check size={12} className="mr-1" />
                      )}
                      {trip.status === "cancelled" && (
                        <X size={12} className="mr-1" />
                      )}
                      {trip.status}
                    </span>
                    <span className="absolute top-4 right-4 text-xl font-bold text-white bg-green-500 px-3 py-1 rounded-full shadow-sm">
                      Rs{trip.price}
                    </span>
                  </div>

                  <div className="p-5 pt-14">
                    {/* Route Info */}
                    <div className="mb-4">
                      <div className="flex items-center text-gray-700 mb-2">
                        <MapPin
                          size={16}
                          className="mr-2 text-green-500 flex-shrink-0"
                        />
                        <span className="font-medium text-gray-900 mr-2">
                          {trip.departureLocation}
                        </span>
                        <ChevronRight
                          size={16}
                          className="mx-1 text-gray-400 flex-shrink-0"
                        />
                        <span className="font-medium text-gray-900">
                          {trip.destinationLocation}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {trip.vehicleDetails?.model || "Comfortable Journey"}
                      </h3>
                    </div>

                    {/* Trip Details Grid */}
                    <div className="grid grid-cols-3 gap-4 py-3 border-y border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Date</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(trip.departureDate)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">Time</span>
                        <span className="font-medium text-gray-900">
                          {trip.departureTime}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">
                          Seats
                        </span>
                        <span className="font-medium text-gray-900">
                          {trip.availableSeats} available
                        </span>
                      </div>
                    </div>

                    {/* Driver Info & Actions */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {trip.driver?.name || "Experienced Driver"}
                          </p>
                          <div className="flex items-center">
                            {[...Array(4)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 text-yellow-400 fill-yellow-400"
                              />
                            ))}
                            <Star className="w-4 h-4 text-gray-300" />
                            <span className="ml-1 text-xs text-gray-500">
                              (4.0)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(trip)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                          title="View Details"
                        >
                          <Info size={18} />
                        </button>

                        {trip.driver?._id === user?._id ? (
                          <>
                            <button
                              onClick={() =>
                                handleStatusUpdate(trip._id, trip.status)
                              }
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                              title="Toggle Status"
                            >
                              <ToggleLeft size={18} />
                            </button>
                            <button
                              onClick={() => handleEditClick(trip)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(trip._id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete"
                            >
                              <Trash size={18} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleBooking(trip)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                            disabled={trip.availableSeats < 1}
                          >
                            <Check size={16} className="mr-1.5" /> Book Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    No trips available
                  </h2>
                  <p className="text-gray-500 mb-6">
                    {statusFilter !== "all"
                      ? `No ${statusFilter} trips found. Try changing your filter.`
                      : "There are no trips available at the moment."}
                  </p>
                  {statusFilter !== "all" ? (
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      View All Trips
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/tripForm")}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <Plus size={18} className="mr-1.5" /> Create New Trip
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pagination */}
            {filteredTrips.length > tripsPerPage && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>

          {/* Map Section */}
          <div className="lg:w-1/2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[calc(100vh-200px)] sticky top-32">
            <GoogleMapComponent
              trips={currentTrips}
              apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            />
          </div>
        </div>
      </main>

      {/* MODAL for "View Details" */}
      {selectedTrip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={closeDetailsModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-xl w-full relative animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-green-600 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-bold">Trip Details</h2>
              <p className="text-green-100 mt-1 flex items-center">
                <MapPin size={16} className="mr-1.5" />
                {selectedTrip.departureLocation} →{" "}
                {selectedTrip.destinationLocation}
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <Calendar size={14} className="mr-1.5" /> Date
                  </div>
                  <p className="text-gray-900 font-medium">
                    {formatDate(selectedTrip.departureDate)}
                  </p>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <Clock size={14} className="mr-1.5" /> Time
                  </div>
                  <p className="text-gray-900 font-medium">
                    {selectedTrip.departureTime}
                  </p>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <DollarSign size={14} className="mr-1.5" /> Price
                  </div>
                  <p className="text-gray-900 font-medium">
                    Rs{selectedTrip.price}
                  </p>
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <User size={14} className="mr-1.5" /> Available Seats
                  </div>
                  <p className="text-gray-900 font-medium">
                    {selectedTrip.availableSeats}
                  </p>
                </div>
                <div className="space-y-4">
                  {selectedTrip.driver && (
                    <div>
                      <div className="flex items-center text-gray-500 text-sm mb-1">
                        <User size={14} className="mr-1.5" /> Driver
                      </div>
                      <p className="text-gray-900 font-medium">
                        {selectedTrip.driver.name}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {selectedTrip.driver.phoneNumber}
                      </p>
                    </div>
                  )}
                  {selectedTrip.vehicleDetails && (
                    <div>
                      <div className="flex items-center text-gray-500 text-sm mb-1">
                        <Car size={14} className="mr-1.5" /> Vehicle
                      </div>
                      <div className="text-gray-900">
                        <p className="font-medium">
                          {selectedTrip.vehicleDetails.model}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedTrip.vehicleDetails.color} ·{" "}
                          {selectedTrip.vehicleDetails.plateNumber}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {selectedTrip.preferences && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-gray-700 font-medium mb-3">
                    Preferences
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <div
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedTrip.preferences.smoking
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedTrip.preferences.smoking
                        ? "Smoking Allowed"
                        : "No Smoking"}
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedTrip.preferences.pets
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedTrip.preferences.pets
                        ? "Pets Allowed"
                        : "No Pets"}
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedTrip.preferences.music
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedTrip.preferences.music
                        ? "Music in Car"
                        : "No Music"}
                    </div>
                  </div>
                </div>
              )}
              {selectedTrip.description && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-gray-700 font-medium mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600">{selectedTrip.description}</p>
                </div>
              )}
              <div className="mt-8 flex flex-wrap justify-end gap-3">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                >
                  <X size={16} className="mr-1.5" /> Close
                </button>
                {selectedTrip.driver?._id !== user?._id && (
                  <button
                    onClick={() => {
                      closeDetailsModal();
                      handleBooking(selectedTrip);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    disabled={selectedTrip.availableSeats < 1}
                  >
                    <Check size={16} className="mr-1.5" /> Book This Trip
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={closeDetailsModal}
              className="absolute top-4 right-4 text-white hover:text-green-100 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL for "Edit Trip" */}
      {editingTrip && editFormData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={closeEditModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full relative animate-fade-in overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-green-600 text-white p-6 rounded-t-xl sticky top-0 z-10">
              <h2 className="text-xl font-bold">Edit Trip</h2>
              <p className="text-green-100 mt-1 flex items-center">
                <MapPin size={16} className="mr-1.5" />
                {editFormData.departureLocation} →{" "}
                {editFormData.destinationLocation}
              </p>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <MapPin size={14} className="mr-1.5 text-gray-500" /> From
                    </label>
                    <input
                      type="text"
                      name="departureLocation"
                      value={editFormData.departureLocation}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Departure location"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <MapPin size={14} className="mr-1.5 text-gray-500" /> To
                    </label>
                    <input
                      type="text"
                      name="destinationLocation"
                      value={editFormData.destinationLocation}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="Destination location"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Calendar size={14} className="mr-1.5 text-gray-500" />{" "}
                      Date
                    </label>
                    <input
                      type="date"
                      name="departureDate"
                      value={
                        editFormData.departureDate
                          ? editFormData.departureDate.split("T")[0]
                          : ""
                      }
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Clock size={14} className="mr-1.5 text-gray-500" /> Time
                    </label>
                    <input
                      type="time"
                      name="departureTime"
                      value={editFormData.departureTime}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <DollarSign size={14} className="mr-1.5 text-gray-500" />{" "}
                      Price (Rs)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        Rs
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditFormChange}
                        className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <User size={14} className="mr-1.5 text-gray-500" />{" "}
                      Available Seats
                    </label>
                    <input
                      type="number"
                      name="availableSeats"
                      value={editFormData.availableSeats}
                      onChange={handleEditFormChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      min="1"
                    />
                  </div>
                </div>
                {editFormData.vehicleDetails && (
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                      <Car size={16} className="mr-2 text-green-600" /> Vehicle
                      Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Model
                        </label>
                        <input
                          type="text"
                          name="vehicleDetails.model"
                          value={editFormData.vehicleDetails.model}
                          onChange={handleEditFormChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Color
                        </label>
                        <input
                          type="text"
                          name="vehicleDetails.color"
                          value={editFormData.vehicleDetails.color}
                          onChange={handleEditFormChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Plate Number
                        </label>
                        <input
                          type="text"
                          name="vehicleDetails.plateNumber"
                          value={editFormData.vehicleDetails.plateNumber}
                          onChange={handleEditFormChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {editFormData.preferences && (
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-4 flex items-center">
                      <Sliders size={16} className="mr-2 text-green-600" />{" "}
                      Preferences
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div
                        className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                          editFormData.preferences.smoking
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300"
                        }`}
                        onClick={() => {
                          setEditFormData({
                            ...editFormData,
                            preferences: {
                              ...editFormData.preferences,
                              smoking: !editFormData.preferences.smoking,
                            },
                          });
                        }}
                      >
                        <input
                          type="checkbox"
                          name="smoking"
                          checked={!!editFormData.preferences.smoking}
                          onChange={handleEditFormChange}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mr-3"
                        />
                        <span>Smoking Allowed</span>
                      </div>
                      <div
                        className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                          editFormData.preferences.pets
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300"
                        }`}
                        onClick={() => {
                          setEditFormData({
                            ...editFormData,
                            preferences: {
                              ...editFormData.preferences,
                              pets: !editFormData.preferences.pets,
                            },
                          });
                        }}
                      >
                        <input
                          type="checkbox"
                          name="pets"
                          checked={!!editFormData.preferences.pets}
                          onChange={handleEditFormChange}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mr-3"
                        />
                        <span>Pets Allowed</span>
                      </div>
                      <div
                        className={`flex items-center p-3 rounded-lg cursor-pointer border ${
                          editFormData.preferences.music
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300"
                        }`}
                        onClick={() => {
                          setEditFormData({
                            ...editFormData,
                            preferences: {
                              ...editFormData.preferences,
                              music: !editFormData.preferences.music,
                            },
                          });
                        }}
                      >
                        <input
                          type="checkbox"
                          name="music"
                          checked={!!editFormData.preferences.music}
                          onChange={handleEditFormChange}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mr-3"
                        />
                        <span>Music in Car</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Info size={14} className="mr-1.5 text-gray-500" />{" "}
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editFormData.description || ""}
                    onChange={handleEditFormChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="Add any additional details about the trip..."
                  />
                </div>
                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <X size={16} className="mr-1.5" /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Save size={16} className="mr-1.5" /> Save Changes
                  </button>
                </div>
              </form>
            </div>
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-white hover:text-green-100 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Payment Method Selection Modal */}
      {paymentModalTrip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={closePaymentModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full relative animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-green-600 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-bold">Choose Payment Method</h2>
              <p className="text-green-100 mt-1 flex items-center">
                <MapPin size={16} className="mr-1.5" />
                {paymentModalTrip.departureLocation} →{" "}
                {paymentModalTrip.destinationLocation}
              </p>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-2">Trip Cost:</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs{paymentModalTrip.price}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <p className="font-medium text-gray-700">
                  Select payment method:
                </p>

                {/* COD Option */}
                <div
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentMethod === "COD"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedPaymentMethod("COD")}
                >
                  <div className="mr-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === "COD"
                          ? "border-green-500"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedPaymentMethod === "COD" && (
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-gray-500">
                      Pay directly to the driver
                    </p>
                  </div>
                </div>

                {/* Online Payment Option */}
                <div
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentMethod === "online"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedPaymentMethod("online")}
                >
                  <div className="mr-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === "online"
                          ? "border-green-500"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedPaymentMethod === "online" && (
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Online Payment</p>
                    <p className="text-sm text-gray-500">
                      Pay via Khalti, eSewa, or other methods
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  onClick={closePaymentModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  disabled={isProcessingPayment}
                >
                  <X size={16} className="mr-1.5" /> Cancel
                </button>
                <button
                  onClick={() => {
                    processBooking();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check size={16} className="mr-1.5" /> Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={closePaymentModal}
              className="absolute top-4 right-4 text-white hover:text-green-100 transition-colors"
              aria-label="Close modal"
              disabled={isProcessingPayment}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default TripList;
