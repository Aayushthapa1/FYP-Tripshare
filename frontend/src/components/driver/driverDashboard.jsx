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
import ProfileModal from "../auth/ProfilePage";
import { getUserProfile } from "../Slices/userSlice";
import { logoutUser } from "../Slices/authSlice";
import { fetchDriverDashboardStats } from "../Slices/driverDashboardSlice";
import { fetchDriverTrips } from "../Slices/tripSlice";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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

  // Prepare Chart.js data for trips over time
  const prepareTripsOverTimeChartData = () => {
    if (!tripsOverTime || tripsOverTime.length === 0) return null;

    const labels = tripsOverTime.map((item) => item._id);
    const tripCounts = tripsOverTime.map((item) => item.count);
    const revenues = tripsOverTime.map((item) => item.revenue);

    return {
      labels,
      datasets: [
        {
          label: "Trip Count",
          data: tripCounts,
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
          yAxisID: "y",
        },
        {
          label: "Revenue (Rs.)",
          data: revenues,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          yAxisID: "y1",
        },
      ],
    };
  };

  // Prepare Chart.js options for trips over time
  const tripsOverTimeOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    stacked: false,
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Trip Count",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Revenue (Rs.)",
        },
      },
    },
  };

  // Prepare Chart.js data for popular routes
  const preparePopularRoutesChartData = () => {
    if (!popularRoutes || popularRoutes.length === 0) return null;

    // Take top 5 for chart display
    const topRoutes = popularRoutes.slice(0, 5);

    return {
      labels: topRoutes.map((route) => `${route._id.from} to ${route._id.to}`),
      datasets: [
        {
          label: "Trip Count",
          data: topRoutes.map((route) => route.count),
          backgroundColor: [
            "rgba(255, 99, 132, 0.5)",
            "rgba(54, 162, 235, 0.5)",
            "rgba(255, 206, 86, 0.5)",
            "rgba(75, 192, 192, 0.5)",
            "rgba(153, 102, 255, 0.5)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare Chart.js data for trip status distribution
  const prepareTripStatusChartData = () => {
    if (!tripStatusDistribution || tripStatusDistribution.length === 0)
      return null;

    const statusColors = {
      Completed: { bg: "rgba(75, 192, 192, 0.5)", border: "rgb(75, 192, 192)" },
      Cancelled: { bg: "rgba(255, 99, 132, 0.5)", border: "rgb(255, 99, 132)" },
      "In Progress": {
        bg: "rgba(54, 162, 235, 0.5)",
        border: "rgb(54, 162, 235)",
      },
      Scheduled: { bg: "rgba(255, 206, 86, 0.5)", border: "rgb(255, 206, 86)" },
      default: { bg: "rgba(153, 102, 255, 0.5)", border: "rgb(153, 102, 255)" },
    };

    const getStatusColor = (status, type) => {
      return (statusColors[status] || statusColors.default)[type];
    };

    return {
      labels: tripStatusDistribution.map((status) => status._id),
      datasets: [
        {
          data: tripStatusDistribution.map((status) => status.count),
          backgroundColor: tripStatusDistribution.map((status) =>
            getStatusColor(status._id, "bg")
          ),
          borderColor: tripStatusDistribution.map((status) =>
            getStatusColor(status._id, "border")
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  // Get chart data
  const tripsOverTimeChartData = prepareTripsOverTimeChartData();
  const popularRoutesChartData = preparePopularRoutesChartData();
  const tripStatusChartData = prepareTripStatusChartData();

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
                    Notifications
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
                   

                  </div>

                  {/* Stats Overview - Using actual data from stats */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                      <div className="flex items-center">
                        <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                          <Route className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Total Trips
                          </p>
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {bookingStats.totalTrips || 0}
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
                            Completed Trips
                          </p>
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {completionRate.completed || 0}
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
                            Completion Rate
                          </p>
                          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {completionRate.completionRate || 0}%
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
                      ) : upcomingRides.length > 0 ? (
                        <div className="space-y-4">
                          {upcomingRides.slice(0, 2).map((ride) => (
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
                                  {ride.passenger}
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

                  {/* Charts and Visualizations */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Trips Chart */}
                    <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                            Trips Over Time
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Trip count and revenue trends
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveSection("statistics")}
                          className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        >
                          View Stats
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </button>
                      </div>

                      <div className="p-4 h-64">
                        {tripsOverTimeChartData ? (
                          <Line
                            data={tripsOverTimeChartData}
                            options={tripsOverTimeOptions}
                          />
                        ) : (
                          <p className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            No trip data available
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Trip Status Chart */}
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

                      <div className="p-4 h-64">
                        {tripStatusChartData ? (
                          <div className="h-full flex justify-center items-center">
                            <div style={{ width: "75%", height: "100%" }}>
                              <Doughnut
                                data={tripStatusChartData}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      position: "right",
                                    },
                                  },
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            No status data available
                          </p>
                        )}
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

                  {/* Trips Over Time Chart */}
                  <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                    <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Trips Over Time
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Trip count and revenue by date
                      </p>
                    </div>

                    <div className="p-4">
                      {tripsOverTimeChartData ? (
                        <div className="h-80">
                          <Line
                            data={tripsOverTimeChartData}
                            options={tripsOverTimeOptions}
                          />
                        </div>
                      ) : (
                        <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                          No trip data available
                        </p>
                      )}
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">
                        Detailed Trip Data
                      </h3>
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
                          {tripsOverTime.length > 5 && (
                            <div className="mt-4 text-center">
                              <button
                                onClick={() =>
                                  setShowAllTripsOverTime(!showAllTripsOverTime)
                                }
                                className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                              >
                                {showAllTripsOverTime
                                  ? "Show Less"
                                  : "View All"}
                              </button>
                            </div>
                          )}
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
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Popular Routes
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Most frequently driven routes
                      </p>
                    </div>

                    <div className="p-4">
                      {popularRoutesChartData ? (
                        <div className="h-64">
                          <Bar
                            data={popularRoutesChartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  display: false,
                                },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  title: {
                                    display: true,
                                    text: "Trip Count",
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                      ) : (
                        <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                          No route data available
                        </p>
                      )}
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">
                        Detailed Route Data
                      </h3>
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
                          {popularRoutes.length > 5 && (
                            <div className="mt-4 text-center">
                              <button
                                onClick={() =>
                                  setShowAllPopularRoutes(!showAllPopularRoutes)
                                }
                                className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                              >
                                {showAllPopularRoutes
                                  ? "Show Less"
                                  : "View All"}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                          No route data available
                        </p>
                      )}
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
                            {completionRate.total || 0}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Completed Trips
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {completionRate.completed || 0}
                          </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Completion Rate
                          </p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {completionRate.completionRate || 0}%
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
                            {completionRate.completionRate || 0}%
                          </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-2.5 rounded-full bg-green-600"
                            style={{
                              width: `${completionRate.completionRate || 0}%`,
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
                    ) : upcomingRides.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingRides.map((ride) => (
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
                                {ride.passenger}
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
                    {tripsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                      </div>
                    ) : (
                      <div>
                        {trips &&
                        trips.filter((trip) => trip.status === "Completed")
                          .length > 0 ? (
                          <div className="space-y-4">
                            {trips
                              .filter((trip) => trip.status === "Completed")
                              .map((trip) => {
                                const completedRide = {
                                  id: trip._id,
                                  date: new Date(
                                    trip.departureDate
                                  ).toLocaleDateString(),
                                  passenger: trip.passengerCount
                                    ? `${trip.passengerCount} passengers`
                                    : "No passenger info",
                                  from: trip.departureLocation,
                                  to: trip.destinationLocation,
                                  rating: trip.rating || 0,
                                  fare: `Rs. ${trip.fare || "N/A"}`,
                                };

                                return (
                                  <div
                                    key={completedRide.id}
                                    className="flex flex-col rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    <div>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {completedRide.date}
                                      </p>
                                      <h4 className="mt-1 font-medium text-gray-900 dark:text-white">
                                        {completedRide.from} to{" "}
                                        {completedRide.to}
                                      </h4>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {completedRide.passenger}
                                      </p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-4 sm:mt-0">
                                      <div className="flex items-center">
                                        <p className="mr-2 font-medium text-gray-900 dark:text-white">
                                          {completedRide.fare}
                                        </p>
                                        {completedRide.rating > 0 && (
                                          <div className="flex items-center">
                                            <span className="mr-1 text-sm text-gray-500 dark:text-gray-400">
                                              Rating:
                                            </span>
                                            <span className="text-yellow-500">
                                              {"★".repeat(completedRide.rating)}
                                              {"☆".repeat(
                                                5 - completedRide.rating
                                              )}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                        Details
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                            No completed rides found
                          </p>
                        )}
                      </div>
                    )}
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
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                          {/* Earnings summary - using real data */}
                          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {statsTimeframe === "week"
                                ? "This Week"
                                : statsTimeframe === "month"
                                ? "This Month"
                                : "This Year"}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              Rs.{" "}
                              {tripsOverTime.reduce(
                                (acc, curr) => acc + curr.revenue,
                                0
                              ) || 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {tripsOverTime.reduce(
                                (acc, curr) => acc + curr.count,
                                0
                              ) || 0}{" "}
                              rides
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Average Per Trip
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              Rs.{" "}
                              {tripsOverTime.reduce(
                                (acc, curr) => acc + curr.count,
                                0
                              ) > 0
                                ? Math.round(
                                    tripsOverTime.reduce(
                                      (acc, curr) => acc + curr.revenue,
                                      0
                                    ) /
                                      tripsOverTime.reduce(
                                        (acc, curr) => acc + curr.count,
                                        0
                                      )
                                  )
                                : 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              per ride
                            </p>
                          </div>
                          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Total Trips
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {bookingStats.totalTrips || 0}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              lifetime
                            </p>
                          </div>
                        </div>

                        {/* Earnings chart */}
                        <div className="mb-6">
                          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                            Earnings Overview
                          </h3>
                          {tripsOverTimeChartData ? (
                            <div className="h-80">
                              <Line
                                data={{
                                  labels: tripsOverTimeChartData.labels,
                                  datasets: [
                                    {
                                      label: "Revenue (Rs.)",
                                      data: tripsOverTimeChartData.datasets[1]
                                        .data,
                                      borderColor: "rgb(75, 192, 192)",
                                      backgroundColor:
                                        "rgba(75, 192, 192, 0.5)",
                                    },
                                  ],
                                }}
                                options={{
                                  responsive: true,
                                  plugins: {
                                    legend: {
                                      position: "top",
                                    },
                                    title: {
                                      display: true,
                                      text: "Revenue Over Time",
                                    },
                                  },
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      title: {
                                        display: true,
                                        text: "Revenue (Rs.)",
                                      },
                                    },
                                  },
                                }}
                              />
                            </div>
                          ) : (
                            <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                              No earnings data available
                            </p>
                          )}
                        </div>

                        {/* Recent earnings */}
                        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                          Recent Earnings
                        </h3>
                        {tripsOverTime && tripsOverTime.length > 0 ? (
                          <div className="space-y-4">
                            {tripsOverTime.slice(0, 5).map((earning, index) => (
                              <div
                                key={index}
                                className="flex flex-col rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {earning._id}
                                  </p>
                                  <h4 className="mt-1 font-medium text-gray-900 dark:text-white">
                                    Rs. {earning.revenue}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Rides: {earning.count}
                                  </p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 sm:mt-0">
                                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    Paid
                                  </span>
                                  <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                    Details
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                            No recent earnings data available
                          </p>
                        )}
                      </>
                    )}
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

                    <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                      Your notifications will appear here
                    </p>
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
