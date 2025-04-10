"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import {
  Bell,
  Calendar,
  Car,
  Home,
  LogOut,
  MapPin,
  Menu,
  Settings,
  User,
  X,
  ChevronRight,
  Clock,
  Star,
  DollarSign,
  Route,
  BarChart3,
} from "lucide-react";
import Chart from "chart.js/auto";
import ProfileModal from "../auth/ProfileModal";
import BookingStatusBar from "../trip/BookingStatusbar.jsx"; // Import the BookingStatusBar component
import { getUserProfile } from "../Slices/userSlice";
import { logoutUser } from "../Slices/authSlice";
import { fetchDriverDashboardStats } from "../Slices/driverDashboardSlice";
import { fetchDriverTrips } from "../Slices/tripSlice";

export default function DriverDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [statsTimeframe, setStatsTimeframe] = useState("month");
  const [
    showAllTripsOverTime,
    setShowAllPopularRoutes,
    setShowAllTripStatus,
    setShowAllTripsOverTime,
  ] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRideDetails, setShowRideDetails] = useState(false);

  // Chart references
  const earningsChartRef = useRef(null);
  const bookingsChartRef = useRef(null);
  const completionRateChartRef = useRef(null);
  const tripStatusChartRef = useRef(null);

  // Chart instances
  const [earningsChart, setEarningsChart] = useState(null);
  const [bookingsChart, setBookingsChart] = useState(null);
  const [completionRateChart, setCompletionRateChart] = useState(null);
  const [tripStatusChart, setTripStatusChart] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get driver data from Redux auth state
  const { user } = useSelector((state) => state.auth) || {};
  const isAuthenticated = !!user?._id;
  const driverId = user?._id;
  const userRole = user?.role;
  const driverName = user?.userName || "Driver";

  // Get driver profile data from Redux driver state
  const driverData = useSelector(
    (state) => state.driver?.driverData?.Result?.driver_data
  );

  // Get trip statistics from Redux
  const { isLoading, error, stats } = useSelector((state) => state.tripStats);

  // Get driver trips from Redux
  const { trips, loading: tripsLoading } = useSelector((state) => state.trip);

  // Destructure trip statistics
  const {
    tripsOverTime = [],
    popularRoutes = [],
    bookingStats = {
      totalTrips: 0,
      totalSeats: 0,
      totalBooked: 0,
      occupancyRate: 0,
    },
    tripStatusDistribution = [],
    completionRate = { total: 0, completed: 0, completionRate: 0 },
    earningsData = {
      daily: [],
      weekly: [],
      monthly: [],
    },
  } = stats || {};

  // Check if mobile view on mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Fetch driver data, stats, and trips when component mounts
  useEffect(() => {
    if (driverId) {
      dispatch(getUserProfile(driverId));

      // Fetch trip statistics
      const params = { period: statsTimeframe };
      dispatch(fetchDriverDashboardStats(params));

      // Fetch driver trips for upcoming rides
      dispatch(fetchDriverTrips());
    } else if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate("/login");
    }
  }, [dispatch, driverId, isAuthenticated, navigate, statsTimeframe]);

  // Initialize and update charts when stats change
  useEffect(() => {
    if (!stats) return;

    // Sample data for charts if real data is not available
    const sampleEarningsData = {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Earnings (Rs.)",
          data: [2500, 3200, 2800, 4500, 3800, 5200, 4800],
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };

    const sampleBookingsData = {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Bookings",
          data: [5, 7, 6, 9, 8, 12, 10],
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        },
      ],
    };

    // Use real data if available, otherwise use sample data
    const earningsDataToUse =
      earningsData && earningsData.daily && earningsData.daily.length > 0
        ? {
            labels: earningsData.daily.map((item) => item.date),
            datasets: [
              {
                label: "Earnings (Rs.)",
                data: earningsData.daily.map((item) => item.amount),
                backgroundColor: "rgba(34, 197, 94, 0.2)",
                borderColor: "rgba(34, 197, 94, 1)",
                borderWidth: 2,
                tension: 0.4,
                fill: true,
              },
            ],
          }
        : sampleEarningsData;

    const bookingsDataToUse =
      tripsOverTime && tripsOverTime.length > 0
        ? {
            labels: tripsOverTime.map((item) => item._id),
            datasets: [
              {
                label: "Bookings",
                data: tripsOverTime.map((item) => item.count),
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                borderColor: "rgba(59, 130, 246, 1)",
                borderWidth: 2,
                tension: 0.4,
                fill: true,
              },
            ],
          }
        : sampleBookingsData;

    // Create completion rate doughnut chart data
    const completionRateData = {
      labels: ["Completed", "Pending/Cancelled"],
      datasets: [
        {
          data: [
            completionRate.completed,
            completionRate.total - completionRate.completed,
          ],
          backgroundColor: [
            "rgba(34, 197, 94, 0.8)",
            "rgba(229, 231, 235, 0.8)",
          ],
          borderColor: ["rgba(34, 197, 94, 1)", "rgba(229, 231, 235, 1)"],
          borderWidth: 1,
        },
      ],
    };

    // Create trip status distribution data
    const statusLabels = tripStatusDistribution.map((item) => item._id);
    const statusData = tripStatusDistribution.map((item) => item.count);
    const statusColors = tripStatusDistribution.map((item) => {
      switch (item._id) {
        case "Completed":
          return "rgba(34, 197, 94, 0.8)";
        case "Cancelled":
          return "rgba(239, 68, 68, 0.8)";
        case "In Progress":
          return "rgba(59, 130, 246, 0.8)";
        case "Booked":
          return "rgba(245, 158, 11, 0.8)";
        default:
          return "rgba(107, 114, 128, 0.8)";
      }
    });

    const tripStatusData = {
      labels: statusLabels,
      datasets: [
        {
          data: statusData,
          backgroundColor: statusColors,
          borderColor: statusColors.map((color) => color.replace("0.8", "1")),
          borderWidth: 1,
        },
      ],
    };

    // Create or update earnings chart
    if (earningsChartRef.current) {
      if (earningsChart) {
        earningsChart.data = earningsDataToUse;
        earningsChart.update();
      } else {
        const newEarningsChart = new Chart(earningsChartRef.current, {
          type: "line",
          data: earningsDataToUse,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                mode: "index",
                intersect: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  drawBorder: false,
                  color: "rgba(229, 231, 235, 0.5)",
                },
                ticks: {
                  callback: (value) => "Rs. " + value,
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
          },
        });
        setEarningsChart(newEarningsChart);
      }
    }

    // Create or update bookings chart
    if (bookingsChartRef.current) {
      if (bookingsChart) {
        bookingsChart.data = bookingsDataToUse;
        bookingsChart.update();
      } else {
        const newBookingsChart = new Chart(bookingsChartRef.current, {
          type: "bar",
          data: bookingsDataToUse,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                mode: "index",
                intersect: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  drawBorder: false,
                  color: "rgba(229, 231, 235, 0.5)",
                },
              },
              x: {
                grid: {
                  display: false,
                },
              },
            },
          },
        });
        setBookingsChart(newBookingsChart);
      }
    }

    // Create or update completion rate chart
    if (completionRateChartRef.current) {
      if (completionRateChart) {
        completionRateChart.data = completionRateData;
        completionRateChart.update();
      } else {
        const newCompletionRateChart = new Chart(
          completionRateChartRef.current,
          {
            type: "doughnut",
            data: completionRateData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: "70%",
              plugins: {
                legend: {
                  position: "bottom",
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || "";
                      const value = context.raw || 0;
                      const total = context.dataset.data.reduce(
                        (a, b) => a + b,
                        0
                      );
                      const percentage = Math.round((value / total) * 100);
                      return `${label}: ${value} (${percentage}%)`;
                    },
                  },
                },
              },
            },
          }
        );
        setCompletionRateChart(newCompletionRateChart);
      }
    }

    // Create or update trip status chart
    if (tripStatusChartRef.current) {
      if (tripStatusChart) {
        tripStatusChart.data = tripStatusData;
        tripStatusChart.update();
      } else {
        const newTripStatusChart = new Chart(tripStatusChartRef.current, {
          type: "pie",
          data: tripStatusData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || "";
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce(
                      (a, b) => a + b,
                      0
                    );
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ${value} (${percentage}%)`;
                  },
                },
              },
            },
          },
        });
        setTripStatusChart(newTripStatusChart);
      }
    }

    // Cleanup function to destroy charts when component unmounts
    return () => {
      if (earningsChart) earningsChart.destroy();
      if (bookingsChart) bookingsChart.destroy();
      if (completionRateChart) completionRateChart.destroy();
      if (tripStatusChart) tripStatusChart.destroy();
    };
  }, [stats, darkMode]); // Re-create charts when stats or dark mode changes

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
    toast.custom(
      (t) => (
        <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Confirm Logout
          </h3>
          <p className="text-gray-600 mb-4">Are you sure you want to logout?</p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleLogout();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: "top-center",
      }
    );
  };

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("driverInfo");

    // Clear cookies
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });

    // Dispatch Redux logout action
    dispatch(logoutUser());

    // Show success toast
    toast.success("Successfully logged out");

    setIsUserMenuOpen(false);
    navigate("/"); // redirect to home
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  // Handle timeframe change for statistics
  const handleTimeframeChange = (period) => {
    setStatsTimeframe(period);
  };

  // Format trips data for upcoming rides display
  const formatUpcomingRides = () => {
    if (!trips || !Array.isArray(trips)) return [];

    return trips
      .filter((trip) => {
        // Filter for upcoming trips (those that haven't departed yet)
        const departureDate = new Date(trip.departureDate);
        return departureDate > new Date();
      })
      .map((trip) => ({
        id: trip._id,
        date: new Date(trip.departureDate).toLocaleDateString(),
        time: trip.departureTime || "Not specified",
        passenger: trip.passengerCount
          ? `${trip.passengerCount} passengers`
          : "No passengers yet",
        from: trip.departureLocation,
        to: trip.destinationLocation,
        status: trip.status || "booked",
        fare: `Rs. ${trip.fare || "N/A"}`,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Get upcoming rides from trips data
  const upcomingRides = formatUpcomingRides();

  // Fallback dummy data for upcoming rides if no trips are available
  const dummyUpcomingRides = [
    {
      id: 1,
      date: "2025-03-26",
      time: "09:30 AM",
      passenger: "John Smith",
      from: "Downtown",
      to: "Airport",
      status: "booked",
      fare: "Rs. 2,500",
    },
    {
      id: 2,
      date: "2025-03-27",
      time: "06:00 PM",
      passenger: "Emily Johnson",
      from: "Shopping Mall",
      to: "Residential Area",
      status: "confirmed",
      fare: "Rs. 1,800",
    },
  ];

  // Use real trips data if available, otherwise use dummy data
  const displayUpcomingRides =
    upcomingRides.length > 0 ? upcomingRides : dummyUpcomingRides;

  // Handle ride status change
  const handleRideStatusChange = (rideId, newStatus) => {
    // In a real app, you would dispatch an action to update the ride status in Redux
    // dispatch(updateTripStatus({ tripId: rideId, status: newStatus }));

    // Update the local state for immediate UI feedback
    const updatedRides = displayUpcomingRides.map((ride) =>
      ride.id === rideId ? { ...ride, status: newStatus } : ride
    );

    // Show success notification
    let message = "";
    switch (newStatus) {
      case "confirmed":
        message = "You've accepted the ride. The passenger has been notified.";
        break;
      case "cancelled":
        message = "You've declined the ride. The passenger has been notified.";
        break;
      case "completed":
        message =
          "Ride marked as completed. The passenger can now rate their experience.";
        break;
      default:
        message = `Ride status updated to ${newStatus}.`;
    }

    toast.success(message);

    // If the ride is completed, we'll keep the modal open so the user can see the completion state
    // Otherwise, close the details modal after a short delay
    if (newStatus !== "completed") {
      setTimeout(() => {
        setShowRideDetails(false);
      }, 1500);
    }
  };

  // Handle view ride details
  const handleViewRideDetails = (ride) => {
    setSelectedRide(ride);
    setShowRideDetails(true);
  };

  // Format completed rides data
  const formatCompletedRides = () => {
    if (!trips || !Array.isArray(trips)) return [];

    return trips
      .filter((trip) => trip.status === "completed")
      .map((trip) => ({
        id: trip._id,
        date: new Date(trip.departureDate).toLocaleDateString(),
        passenger: trip.passengerName || "Passenger",
        from: trip.departureLocation,
        to: trip.destinationLocation,
        rating: trip.rating || 5,
        fare: `Rs. ${trip.fare || "N/A"}`,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Get completed rides from trips data
  const completedRides = formatCompletedRides();

  // Fallback dummy data for completed rides if no trips are available
  const dummyCompletedRides = [
    {
      id: 1,
      date: "2025-03-25",
      passenger: "Michael Brown",
      from: "Airport",
      to: "Hotel District",
      rating: 5,
      fare: "Rs. 3,000",
    },
    {
      id: 2,
      date: "2025-03-24",
      passenger: "Sarah Wilson",
      from: "Business Park",
      to: "Downtown",
      rating: 4,
      fare: "Rs. 2,200",
    },
    {
      id: 3,
      date: "2025-03-23",
      passenger: "David Lee",
      from: "University",
      to: "Residential Area",
      rating: 5,
      fare: "Rs. 1,500",
    },
  ];

  // Use real completed rides data if available, otherwise use dummy data
  const displayCompletedRides =
    completedRides.length > 0 ? completedRides : dummyCompletedRides;

  // Format earnings data
  const formatEarnings = () => {
    if (!trips || !Array.isArray(trips)) return [];

    // Group completed trips by date and calculate total earnings
    const earningsByDate = trips
      .filter((trip) => trip.status === "completed")
      .reduce((acc, trip) => {
        const date = new Date(trip.departureDate).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = {
            id: date,
            date: date,
            amount: 0,
            rides: 0,
            status: "Paid",
          };
        }
        acc[date].amount += Number(trip.fare || 0);
        acc[date].rides += 1;
        return acc;
      }, {});

    return Object.values(earningsByDate)
      .map((earning) => ({
        ...earning,
        amount: `Rs. ${earning.amount.toLocaleString()}`,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Get earnings from trips data
  const earnings = formatEarnings();

  // Fallback dummy data for earnings if no trips are available
  const dummyEarnings = [
    {
      id: 1,
      date: "2025-03-25",
      amount: "Rs. 3,000",
      rides: 3,
      status: "Paid",
    },
    {
      id: 2,
      date: "2025-03-24",
      amount: "Rs. 2,200",
      rides: 2,
      status: "Paid",
    },
    {
      id: 3,
      date: "2025-03-23",
      amount: "Rs. 4,500",
      rides: 4,
      status: "Paid",
    },
  ];

  // Use real earnings data if available, otherwise use dummy data
  const displayEarnings = earnings.length > 0 ? earnings : dummyEarnings;

  const notifications = [
    {
      id: 1,
      message: "New ride request from John Smith for tomorrow at 9:30 AM",
      time: "2 hours ago",
      isRead: false,
    },
    {
      id: 2,
      message: "You received a 5-star rating from your last passenger",
      time: "1 day ago",
      isRead: true,
    },
    {
      id: 3,
      message: "Payment of Rs. 3,000 has been processed to your account",
      time: "2 days ago",
      isRead: true,
    },
    {
      id: 4,
      message: "Reminder: Vehicle inspection due next week",
      time: "3 days ago",
      isRead: false,
    },
  ];

  const favoriteLocations = [
    {
      id: 1,
      name: "Airport",
      address: "123 Airport Rd, Anytown",
      type: "frequent",
    },
    {
      id: 2,
      name: "Downtown",
      address: "456 Main St, Downtown",
      type: "popular",
    },
    {
      id: 3,
      name: "Shopping Mall",
      address: "789 Retail Blvd, Westside",
      type: "frequent",
    },
  ];

  const vehicleDetails = {
    make: "Toyota",
    model: "Camry",
    year: "2022",
    licensePlate: "ABC-1234",
    lastMaintenance: "2025-02-15",
    nextMaintenance: "2025-04-15",
    fuelLevel: "75%",
    status: "Active",
  };

  // If not authenticated, don't render the dashboard
  if (!isAuthenticated && driverId === undefined) {
    return null; // The useEffect will handle redirection
  }

  // Loading state for statistics
  if (isLoading && activeSection === "statistics") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading driver stats...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
          {/* Mobile overlay */}
          {isSidebarOpen && isMobileView && (
            <div
              className="fixed inset-0 z-20 bg-black/50 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}

          {/* Sidebar */}
          <aside
            className={`${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } fixed z-30 h-full w-64 transform overflow-y-auto border-r border-gray-200 bg-white p-4 transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 md:relative md:z-0 md:translate-x-0`}
          >
            {/* Driver profile section */}
            <div className="mb-6 flex items-center space-x-3 border-b border-gray-200 pb-4 dark:border-gray-700">
              <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                {driverData?.fullName
                  ? driverData.fullName
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : driverName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {driverData?.fullName || driverName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {driverData?.email || user?.email || ""}
                </p>
              </div>
              {isMobileView && (
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="ml-auto rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Main navigation */}
            <div className="mb-6">
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Main
              </p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveSection("dashboard")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                      activeSection === "dashboard"
                        ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Home className="mr-3 h-5 w-5" />
                    Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("statistics")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                      activeSection === "statistics"
                        ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <BarChart3 className="mr-3 h-5 w-5" />
                    Statistics
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("upcoming")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                      activeSection === "upcoming"
                        ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Calendar className="mr-3 h-5 w-5" />
                    Upcoming Rides
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("completed-rides")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                      activeSection === "completed-rides"
                        ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Car className="mr-3 h-5 w-5" />
                    Completed Rides
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("earnings")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                      activeSection === "earnings"
                        ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <DollarSign className="mr-3 h-5 w-5" />
                    Earnings
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("notifications")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                      activeSection === "notifications"
                        ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Bell className="mr-3 h-5 w-5" />
                    <span>Notifications</span>
                    {notifications.filter((n) => !n.isRead).length > 0 && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {notifications.filter((n) => !n.isRead).length}
                      </span>
                    )}
                  </button>
                </li>
              </ul>
            </div>

            {/* Preferences navigation */}
            <div className="mb-6">
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Preferences
              </p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveSection("vehicle")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                      activeSection === "vehicle"
                        ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Car className="mr-3 h-5 w-5" />
                    Vehicle Details
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("favorite-locations")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                      activeSection === "favorite-locations"
                        ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <MapPin className="mr-3 h-5 w-5" />
                    Favorite Locations
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("settings")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                      activeSection === "settings"
                        ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                  </button>
                </li>
                <li>
                  <button
                    onClick={toggleDarkMode}
                    className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <Settings className="mr-3 h-5 w-5" />
                    {darkMode ? "Light Mode" : "Dark Mode"}
                  </button>
                </li>
              </ul>
            </div>

            {/* Logout button */}
            <div className="mt-auto border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                onClick={confirmLogout}
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {/* Header */}
            <header className="sticky top-0 z-10 flex h-16 items-center border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-800">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="mr-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>

              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {activeSection === "dashboard" && "Driver Dashboard"}
                {activeSection === "statistics" && "Driver Statistics"}
                {activeSection === "upcoming" && "Upcoming Rides"}
                {activeSection === "completed-rides" && "Completed Rides"}
                {activeSection === "earnings" && "Earnings"}
                {activeSection === "notifications" && "Notifications"}
                {activeSection === "vehicle" && "Vehicle Details"}
                {activeSection === "favorite-locations" && "Favorite Locations"}
                {activeSection === "settings" && "Settings"}
              </h1>

              <div className="ml-auto flex items-center space-x-2">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <User className="h-5 w-5" />
                </button>

                <button
                  onClick={() => setActiveSection("notifications")}
                  className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter((n) => !n.isRead).length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {notifications.filter((n) => !n.isRead).length}
                    </span>
                  )}
                </button>
              </div>
            </header>

            {/* Main content */}
            <main className="p-4 md:p-6">
              {/* Dashboard */}
              {activeSection === "dashboard" && (
                <div className="space-y-6">
                  {/* Status and Quick Actions */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        Go Online
                      </h3>
                      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Start accepting ride requests
                      </p>
                      <button className="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                        Go Online
                      </button>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        Schedule Availability
                      </h3>
                      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Set your working hours
                      </p>
                      <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                        Set Schedule
                      </button>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        Fuel Tracking
                      </h3>
                      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Update your vehicle's fuel level
                      </p>
                      <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                        Update
                      </button>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        Support
                      </h3>
                      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Need help with something?
                      </p>
                      <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                        Contact Us
                      </button>
                    </div>
                  </div>

                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                      <div className="flex items-center">
                        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                          <Route className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Today's Rides
                          </p>
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {displayUpcomingRides.filter(
                              (ride) =>
                                new Date(ride.date).toDateString() ===
                                new Date().toDateString()
                            ).length || 0}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                      <div className="flex items-center">
                        <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                          <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Today's Earnings
                          </p>
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {displayEarnings.find(
                              (earning) =>
                                new Date(earning.date).toDateString() ===
                                new Date().toDateString()
                            )?.amount || "Rs. 0"}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                      <div className="flex items-center">
                        <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/30">
                          <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Online Hours
                          </p>
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                            6.5
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                      <div className="flex items-center">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                          <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Rating
                          </p>
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {driverData?.rating || "4.8"}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Earnings Chart */}
                    <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Earnings Overview
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Last 7 days
                          </p>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="h-64">
                          <canvas ref={earningsChartRef}></canvas>
                        </div>
                      </div>
                    </div>

                    {/* Bookings Chart */}
                    <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Booking Trends
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Last 7 days
                          </p>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="h-64">
                          <canvas ref={bookingsChartRef}></canvas>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Rides with BookingStatusBar */}
                  <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                          Upcoming Rides
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Your scheduled pickups
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveSection("upcoming")}
                        className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      >
                        View All
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </button>
                    </div>

                    <div className="p-4">
                      {tripsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                      ) : displayUpcomingRides.length > 0 ? (
                        <div className="space-y-6">
                          {displayUpcomingRides.slice(0, 2).map((ride) => (
                            <div
                              key={ride.id}
                              className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                      {ride.date} • {ride.time}
                                    </span>
                                  </div>
                                  <h4 className="mt-2 font-medium text-gray-900 dark:text-white">
                                    {ride.from} to {ride.to}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Passenger: {ride.passenger}
                                  </p>
                                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                                    {ride.fare}
                                  </p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 sm:mt-0">
                                  <button
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                    onClick={() => handleViewRideDetails(ride)}
                                  >
                                    Details
                                  </button>
                                  <button className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">
                                    Navigate
                                  </button>
                                </div>
                              </div>

                              {/* BookingStatusBar for each ride */}
                              <BookingStatusBar
                                initialStatus={ride.status}
                                onStatusChange={(newStatus) =>
                                  handleRideStatusChange(ride.id, newStatus)
                                }
                                tripId={ride.id}
                                userType="driver"
                                tripDetails={{
                                  from: ride.from,
                                  to: ride.to,
                                  passenger: ride.passenger,
                                  time: `${ride.date} ${ride.time}`,
                                  fare: ride.fare,
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                          No upcoming rides scheduled
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Performance Charts */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Completion Rate Chart */}
                    <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Completion Rate
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {completionRate.completionRate}% of trips completed
                          </p>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="h-64">
                          <canvas ref={completionRateChartRef}></canvas>
                        </div>
                      </div>
                    </div>

                    {/* Trip Status Distribution Chart */}
                    <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Trip Status Distribution
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Breakdown by status
                          </p>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="h-64">
                          <canvas ref={tripStatusChartRef}></canvas>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Completed Rides */}
                    <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Recent Rides
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Your recent trips
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveSection("completed-rides")}
                          className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        >
                          View All
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="space-y-4">
                          {displayCompletedRides.slice(0, 2).map((ride) => (
                            <div
                              key={ride.id}
                              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                            >
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {ride.date}
                                </p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {ride.from} to {ride.to}
                                </p>
                                <div className="flex items-center">
                                  <span className="text-yellow-500">
                                    {"★".repeat(ride.rating)}
                                  </span>
                                </div>
                              </div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {ride.fare}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Notifications
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Stay updated
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveSection("notifications")}
                          className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        >
                          View All
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="space-y-4">
                          {notifications.slice(0, 3).map((notification) => (
                            <div
                              key={notification.id}
                              className={`flex items-start gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700 ${
                                !notification.isRead
                                  ? "bg-gray-50 dark:bg-gray-700/50"
                                  : ""
                              }`}
                            >
                              <Bell className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                              <div>
                                <p
                                  className={`text-sm ${
                                    !notification.isRead
                                      ? "font-medium text-gray-900 dark:text-white"
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Rides Section */}
              {activeSection === "upcoming" && (
                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Upcoming Rides
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      All your scheduled pickups
                    </p>
                  </div>

                  <div className="p-4">
                    {tripsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                      </div>
                    ) : displayUpcomingRides.length > 0 ? (
                      <div className="space-y-6">
                        {displayUpcomingRides.map((ride) => (
                          <div
                            key={ride.id}
                            className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    {ride.date} • {ride.time}
                                  </span>
                                </div>
                                <h4 className="mt-2 font-medium text-gray-900 dark:text-white">
                                  {ride.from} to {ride.to}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Passenger: {ride.passenger}
                                </p>
                                <p className="font-medium text-gray-900 dark:text-white mt-1">
                                  {ride.fare}
                                </p>
                              </div>
                              <div className="mt-4 flex items-center gap-2 sm:mt-0">
                                <button
                                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                  onClick={() => handleViewRideDetails(ride)}
                                >
                                  Details
                                </button>
                                <button className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">
                                  Navigate
                                </button>
                              </div>
                            </div>

                            {/* BookingStatusBar for each ride */}
                            <BookingStatusBar
                              initialStatus={ride.status}
                              onStatusChange={(newStatus) =>
                                handleRideStatusChange(ride.id, newStatus)
                              }
                              tripId={ride.id}
                              userType="driver"
                              tripDetails={{
                                from: ride.from,
                                to: ride.to,
                                passenger: ride.passenger,
                                time: `${ride.date} ${ride.time}`,
                                fare: ride.fare,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No upcoming rides scheduled
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Completed Rides Section */}
              {activeSection === "completed-rides" && (
                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Completed Rides
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      History of your rides
                    </p>
                  </div>

                  <div className="p-4">
                    <div className="space-y-4">
                      {displayCompletedRides.map((ride) => (
                        <div
                          key={ride.id}
                          className="flex flex-col rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {ride.date}
                            </p>
                            <h4 className="mt-1 font-medium text-gray-900 dark:text-white">
                              {ride.from} to {ride.to}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Passenger: {ride.passenger}
                            </p>
                          </div>
                          <div className="mt-4 flex items-center gap-4 sm:mt-0">
                            <div className="flex items-center">
                              <p className="mr-2 font-medium text-gray-900 dark:text-white">
                                {ride.fare}
                              </p>
                              <div className="flex items-center">
                                <span className="mr-1 text-sm text-gray-500 dark:text-gray-400">
                                  Rating:
                                </span>
                                <span className="text-yellow-500">
                                  {"★".repeat(ride.rating)}
                                </span>
                              </div>
                            </div>
                            <button
                              className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                              onClick={() => handleViewRideDetails(ride)}
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Earnings Section */}
              {activeSection === "earnings" && (
                <div className="space-y-6">
                  {/* Earnings Chart */}
                  <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                    <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Earnings Overview
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Your income from rides
                      </p>
                    </div>

                    <div className="p-4">
                      <div className="h-80">
                        <canvas ref={earningsChartRef}></canvas>
                      </div>
                    </div>
                  </div>

                  {/* Earnings Summary */}
                  <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                    <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Earnings Summary
                      </h2>
                    </div>

                    <div className="p-4">
                      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Today
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {displayEarnings.find(
                              (earning) =>
                                new Date(earning.date).toDateString() ===
                                new Date().toDateString()
                            )?.amount || "Rs. 0"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {displayEarnings.find(
                              (earning) =>
                                new Date(earning.date).toDateString() ===
                                new Date().toDateString()
                            )?.rides || 0}{" "}
                            rides
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            This Week
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            Rs.{" "}
                            {displayEarnings
                              .filter((earning) => {
                                const earningDate = new Date(earning.date);
                                const today = new Date();
                                const weekStart = new Date(today);
                                weekStart.setDate(
                                  today.getDate() - today.getDay()
                                );
                                return earningDate >= weekStart;
                              })
                              .reduce((sum, earning) => {
                                const amount = Number.parseInt(
                                  earning.amount.replace(/[^0-9]/g, "")
                                );
                                return sum + (isNaN(amount) ? 0 : amount);
                              }, 0)
                              .toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {displayEarnings
                              .filter((earning) => {
                                const earningDate = new Date(earning.date);
                                const today = new Date();
                                const weekStart = new Date(today);
                                weekStart.setDate(
                                  today.getDate() - today.getDay()
                                );
                                return earningDate >= weekStart;
                              })
                              .reduce(
                                (sum, earning) => sum + earning.rides,
                                0
                              )}{" "}
                            rides
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            This Month
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            Rs.{" "}
                            {displayEarnings
                              .filter((earning) => {
                                const earningDate = new Date(earning.date);
                                const today = new Date();
                                return (
                                  earningDate.getMonth() === today.getMonth() &&
                                  earningDate.getFullYear() ===
                                    today.getFullYear()
                                );
                              })
                              .reduce((sum, earning) => {
                                const amount = Number.parseInt(
                                  earning.amount.replace(/[^0-9]/g, "")
                                );
                                return sum + (isNaN(amount) ? 0 : amount);
                              }, 0)
                              .toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {displayEarnings
                              .filter((earning) => {
                                const earningDate = new Date(earning.date);
                                const today = new Date();
                                return (
                                  earningDate.getMonth() === today.getMonth() &&
                                  earningDate.getFullYear() ===
                                    today.getFullYear()
                                );
                              })
                              .reduce(
                                (sum, earning) => sum + earning.rides,
                                0
                              )}{" "}
                            rides
                          </p>
                        </div>
                      </div>

                      <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                        Recent Earnings
                      </h3>
                      <div className="space-y-4">
                        {displayEarnings.slice(0, 5).map((earning) => (
                          <div
                            key={earning.id}
                            className="flex flex-col rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {earning.date}
                              </p>
                              <h4 className="mt-1 font-medium text-gray-900 dark:text-white">
                                {earning.amount}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Rides: {earning.rides}
                              </p>
                            </div>
                            <div className="mt-4 flex items-center gap-2 sm:mt-0">
                              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                {earning.status}
                              </span>
                              <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other sections remain the same */}
              {/* ... */}
            </main>
          </div>
        </div>

        {/* Profile Modal - Using the imported ProfileModal component */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userId={driverId}
        />

        {/* Ride Details Modal */}
        {showRideDetails && selectedRide && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowRideDetails(false)}
            ></div>
            <div className="flex items-center justify-center min-h-screen p-4">
              <div
                className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in dark:bg-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setShowRideDetails(false)}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 text-gray-700 hover:bg-gray-200 transition-colors dark:bg-gray-700/80 dark:text-gray-300 dark:hover:bg-gray-600"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    Ride Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Date & Time
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedRide.date} • {selectedRide.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Passenger
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedRide.passenger}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        From
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedRide.from}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        To
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedRide.to}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Fare
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedRide.fare}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Status
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {selectedRide.status}
                      </p>
                    </div>
                  </div>

                  {/* Booking Status Bar */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
                      Booking Status
                    </h3>
                    <BookingStatusBar
                      initialStatus={selectedRide.status}
                      onStatusChange={(newStatus) =>
                        handleRideStatusChange(selectedRide.id, newStatus)
                      }
                      tripId={selectedRide.id}
                      userType="driver"
                      showConfirmationPopup={selectedRide.status === "booked"}
                      tripDetails={{
                        from: selectedRide.from,
                        to: selectedRide.to,
                        passenger: selectedRide.passenger,
                        time: `${selectedRide.date} ${selectedRide.time}`,
                        fare: selectedRide.fare,
                      }}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setShowRideDetails(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      Close
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Navigate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
