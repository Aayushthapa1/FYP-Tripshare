"use client";

import { useState, useEffect } from "react";
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
  ChevronDown,
} from "lucide-react";
import ProfileModal from "../auth/ProfileModal";
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
  const [showAllTripsOverTime, setShowAllTripsOverTime] = useState(false);
  const [showAllPopularRoutes, setShowAllPopularRoutes] = useState(false);
  const [showAllTripStatus, setShowAllTripStatus] = useState(false);

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
        status: trip.status || "Scheduled",
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
      status: "Confirmed",
      fare: "Rs. 2,500",
    },
    {
      id: 2,
      date: "2025-03-27",
      time: "06:00 PM",
      passenger: "Emily Johnson",
      from: "Shopping Mall",
      to: "Residential Area",
      status: "Confirmed",
      fare: "Rs. 1,800",
    },
  ];

  // Use real trips data if available, otherwise use dummy data
  const displayUpcomingRides =
    upcomingRides.length > 0 ? upcomingRides : dummyUpcomingRides;

  const completedRides = [
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

  const earnings = [
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
                            5
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
                            Rs. 7,500
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
                            4.8
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Rides */}
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
                        <div className="space-y-4">
                          {displayUpcomingRides.slice(0, 2).map((ride) => (
                            <div
                              key={ride.id}
                              className="flex flex-col rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    {ride.date} • {ride.time}
                                  </span>
                                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    {ride.status}
                                  </span>
                                </div>
                                <h4 className="mt-2 font-medium text-gray-900 dark:text-white">
                                  {ride.from} to {ride.to}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Passenger: {ride.passenger}
                                </p>
                              </div>
                              <div className="mt-4 flex items-center gap-2 sm:mt-0">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {ride.fare}
                                </p>
                                <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                  Details
                                </button>
                              </div>
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
                          {completedRides.slice(0, 2).map((ride) => (
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

              {/* Statistics Section */}
              {activeSection === "statistics" && (
                <div className="space-y-6">
                  {/* Timeframe selector */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Driver Statistics
                    </h2>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTimeframeChange("week")}
                        className={`rounded-lg px-3 py-1 text-sm ${
                          statsTimeframe === "week"
                            ? "bg-green-600 text-white"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        Week
                      </button>
                      <button
                        onClick={() => handleTimeframeChange("month")}
                        className={`rounded-lg px-3 py-1 text-sm ${
                          statsTimeframe === "month"
                            ? "bg-green-600 text-white"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        Month
                      </button>
                      <button
                        onClick={() => handleTimeframeChange("year")}
                        className={`rounded-lg px-3 py-1 text-sm ${
                          statsTimeframe === "year"
                            ? "bg-green-600 text-white"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        Year
                      </button>
                    </div>
                  </div>

                  {/* Trips Over Time */}
                  <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                    <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Trips Over Time
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Trip count and revenue by date
                          </p>
                        </div>
                        {tripsOverTime.length > 5 && (
                          <button
                            onClick={() =>
                              setShowAllTripsOverTime(!showAllTripsOverTime)
                            }
                            className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          >
                            {showAllTripsOverTime ? "Show Less" : "View More"}
                            <ChevronDown
                              className={`ml-1 h-4 w-4 transition-transform ${
                                showAllTripsOverTime ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      {tripsOverTime && tripsOverTime.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                                  Date
                                </th>
                                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                                  Trip Count
                                </th>
                                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                                  Revenue
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(showAllTripsOverTime
                                ? tripsOverTime
                                : tripsOverTime.slice(0, 5)
                              ).map((day, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-gray-200 dark:border-gray-700"
                                >
                                  <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {day._id}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {day.count}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                                    Rs. {day.revenue}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                          No trip data available
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Popular Routes */}
                  <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                    <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Popular Routes
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Most frequently driven routes
                          </p>
                        </div>
                        {popularRoutes.length > 5 && (
                          <button
                            onClick={() =>
                              setShowAllPopularRoutes(!showAllPopularRoutes)
                            }
                            className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          >
                            {showAllPopularRoutes ? "Show Less" : "View More"}
                            <ChevronDown
                              className={`ml-1 h-4 w-4 transition-transform ${
                                showAllPopularRoutes ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      {popularRoutes && popularRoutes.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                                  From
                                </th>
                                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                                  To
                                </th>
                                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                                  Count
                                </th>
                                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                                  Avg Price
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(showAllPopularRoutes
                                ? popularRoutes
                                : popularRoutes.slice(0, 5)
                              ).map((route, index) => (
                                <tr
                                  key={index}
                                  className="border-b border-gray-200 dark:border-gray-700"
                                >
                                  <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {route._id.from}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {route._id.to}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                                    {route.count}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                                    Rs. {route.avgPrice}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                          No route data available
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Booking Stats and Trip Status */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Booking Stats */}
                    <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                          Booking Stats
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Seat occupancy and booking metrics
                        </p>
                      </div>

                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Total Trips
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {bookingStats.totalTrips}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Total Seats
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {bookingStats.totalSeats}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Booked Seats
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {bookingStats.totalBooked}
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Occupancy Rate
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {bookingStats.occupancyRate}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trip Status Distribution */}
                    <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                              Trip Status Distribution
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Breakdown of trip statuses
                            </p>
                          </div>
                          {tripStatusDistribution.length > 5 && (
                            <button
                              onClick={() =>
                                setShowAllTripStatus(!showAllTripStatus)
                              }
                              className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                            >
                              {showAllTripStatus ? "Show Less" : "View More"}
                              <ChevronDown
                                className={`ml-1 h-4 w-4 transition-transform ${
                                  showAllTripStatus ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        {tripStatusDistribution &&
                        tripStatusDistribution.length > 0 ? (
                          <div className="space-y-4">
                            {(showAllTripStatus
                              ? tripStatusDistribution
                              : tripStatusDistribution.slice(0, 5)
                            ).map((statusItem, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center">
                                  <div
                                    className={`h-3 w-3 rounded-full ${
                                      statusItem._id === "Completed"
                                        ? "bg-green-500"
                                        : statusItem._id === "Cancelled"
                                        ? "bg-red-500"
                                        : statusItem._id === "In Progress"
                                        ? "bg-blue-500"
                                        : "bg-gray-500"
                                    } mr-2`}
                                  ></div>
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {statusItem._id}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="mr-2 text-sm font-medium text-gray-900 dark:text-white">
                                    {statusItem.count}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    trips
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                            No status data available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Completion Rate */}
                  <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                    <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Completion Rate
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Trip completion metrics
                      </p>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Trips
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {completionRate.total}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Completed Trips
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {completionRate.completed}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Completion Rate
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {completionRate.completionRate}%
                          </p>
                        </div>
                      </div>

                      {/* Progress bar for completion rate */}
                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Completion Rate
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {completionRate.completionRate}%
                          </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-2.5 rounded-full bg-green-600"
                            style={{
                              width: `${completionRate.completionRate}%`,
                            }}
                          ></div>
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
                      <div className="space-y-4">
                        {displayUpcomingRides.map((ride) => (
                          <div
                            key={ride.id}
                            className="flex flex-col rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  {ride.date} • {ride.time}
                                </span>
                                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  {ride.status}
                                </span>
                              </div>
                              <h4 className="mt-2 font-medium text-gray-900 dark:text-white">
                                {ride.from} to {ride.to}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Passenger: {ride.passenger}
                              </p>
                            </div>
                            <div className="mt-4 flex items-center gap-2 sm:mt-0">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {ride.fare}
                              </p>
                              <div className="flex gap-2">
                                <button className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700">
                                  Cancel
                                </button>
                                <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                  Navigate
                                </button>
                              </div>
                            </div>
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
                      {completedRides.map((ride) => (
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
                            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
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
                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Earnings
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Your income from rides
                    </p>
                  </div>

                  <div className="p-4">
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Today
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          Rs. 7,500
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          5 rides
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          This Week
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          Rs. 32,000
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          22 rides
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          This Month
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          Rs. 125,000
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          85 rides
                        </p>
                      </div>
                    </div>

                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                      Recent Earnings
                    </h3>
                    <div className="space-y-4">
                      {earnings.map((earning) => (
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
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Notifications
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Stay updated with your activity
                    </p>
                  </div>

                  <div className="p-4">
                    <div className="mb-4 flex justify-end">
                      <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                        Mark All as Read
                      </button>
                    </div>

                    <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-4">
                        <button className="border-b-2 border-green-600 px-4 py-2 text-sm font-medium text-green-600 dark:border-green-400 dark:text-green-400">
                          All
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                          Unread
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700 ${
                            !notification.isRead
                              ? "bg-gray-50 dark:bg-gray-700/50"
                              : ""
                          }`}
                        >
                          <Bell className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                          <div className="flex-1">
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
                          {!notification.isRead && (
                            <button className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                              Mark as Read
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Vehicle Details Section */}
              {activeSection === "vehicle" && (
                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Vehicle Details
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Information about your vehicle
                    </p>
                  </div>

                  <div className="p-4">
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                          Vehicle Information
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Make:
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {vehicleDetails.make}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Model:
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {vehicleDetails.model}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Year:
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {vehicleDetails.year}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              License Plate:
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {vehicleDetails.licensePlate}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                          Maintenance Status
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Last Maintenance:
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {vehicleDetails.lastMaintenance}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Next Maintenance:
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {vehicleDetails.nextMaintenance}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Fuel Level:
                            </p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {vehicleDetails.fuelLevel}
                            </p>
                          </div>
                          <div className="flex justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Status:
                            </p>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">
                              {vehicleDetails.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                        Update Fuel Level
                      </button>
                      <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                        Report Issue
                      </button>
                      <button className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
                        Schedule Maintenance
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Favorite Locations Section */}
              {activeSection === "favorite-locations" && (
                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Favorite Locations
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Your frequently visited places
                      </p>
                    </div>
                    <button className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                      Add Location
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="space-y-4">
                      {favoriteLocations.map((location) => (
                        <div
                          key={location.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                {location.type}
                              </span>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {location.name}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {location.address}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                              Navigate
                            </button>
                            <button className="rounded-lg border border-red-300 bg-white px-3 py-1 text-sm text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Section */}
              {activeSection === "settings" && (
                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Settings
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Manage your account preferences
                    </p>
                  </div>

                  <div className="p-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Account Settings
                        </h3>
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Email Notifications
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Receive email updates about your rides
                              </p>
                            </div>
                            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                              Enabled
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                SMS Notifications
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Receive text messages about your rides
                              </p>
                            </div>
                            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                              Enabled
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Dark Mode
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Toggle between light and dark theme
                              </p>
                            </div>
                            <button
                              className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                              onClick={toggleDarkMode}
                            >
                              {darkMode ? "Enabled" : "Disabled"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Driver Preferences
                        </h3>
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Automatic Ride Acceptance
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Automatically accept ride requests
                              </p>
                            </div>
                            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                              Disabled
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Navigation Voice
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Choose voice for navigation instructions
                              </p>
                            </div>
                            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                              Default
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Payment Settings
                        </h3>
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Payment Method
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Bank Account ending in 4567
                              </p>
                            </div>
                            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                              Change
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Instant Payout
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Get paid instantly after each ride
                              </p>
                            </div>
                            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                              Enabled
                            </button>
                          </div>
                        </div>
                      </div>

                      <button className="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Profile Modal - Using the imported ProfileModal component */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userId={driverId}
        />
      </div>
    </>
  );
}
