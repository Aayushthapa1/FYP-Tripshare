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
  Menu,
  User,
  X,
  ChevronLeft,
  BarChart3,
  Route,
  Banknote,
  ChevronRight,
  Settings,
  Star,
  MapPin,
  Clock,
} from "lucide-react";
import ProfileModal from "../auth/ProfilePage";
import { getUserProfile } from "../Slices/userSlice";
import { logoutUser } from "../Slices/authSlice";
import { fetchDriverDashboardStats } from "../Slices/driverDashboardSlice";
import { fetchDriverTrips } from "../Slices/tripSlice";
import {
  fetchDriverPendingBookings,
  fetchDriverBookings,
  clearBookingError,
} from "../Slices/bookingSlice";

// Import section components
import DashboardOverview from "./sections/DashboardOverview";
import StatisticsSection from "./sections/StatisticsSection";

import EarningsSection from "./sections/EarningsSection";
import MyBookingsSection from "./sections/MyBookingsSection";
import MyRatings from "./sections/MyRatings.jsx";

// Import NotificationCenter at the top of the file
import NotificationCenter from "../socket/notificationDropdown";

export default function DriverDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [statsTimeframe, setStatsTimeframe] = useState("month");
  const [upcomingTrips, setUpcomingTrips] = useState([]);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [myTrips, setMyTrips] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] =
    useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get driver data from Redux auth state
  const { user } = useSelector((state) => state.auth) || {};
  const isAuthenticated = !!user?._id;
  const driverId = user?._id;
  const driverName = user?.userName || "Driver";

  // Get driver profile data from Redux driver state
  const driverData = useSelector(
    (state) => state.driver?.driverData?.Result?.driver_data
  );

  // Get trip statistics from Redux
  const { isLoading, stats } = useSelector((state) => state.tripStats);

  // Get bookings from Redux state
  const {
    loading: bookingsLoading,
    error: bookingsError,
    lastAction,
  } = useSelector((state) => state.booking);

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

  // Handle booking error
  useEffect(() => {
    if (bookingsError) {
      toast.error("Error Loading Bookings", {
        description:
          bookingsError || "Failed to load your bookings. Please try again.",
      });
      dispatch(clearBookingError());
    }
  }, [bookingsError, dispatch]);

  // Fetch bookings and update state when component mounts or lastAction changes
  useEffect(() => {
    if (driverId) {
      // Fetch driver pending bookings for upcoming rides
      dispatch(fetchDriverPendingBookings())
        .then((result) => {
          if (result.payload && Array.isArray(result.payload)) {
            console.log("Pending bookings fetched:", result.payload);
          }
        })
        .catch((error) => {
          console.error("Error fetching pending bookings:", error);
        });

      // Fetch all driver bookings
      dispatch(fetchDriverBookings())
        .then((result) => {
          if (result.payload && Array.isArray(result.payload)) {
            const allBookings = result.payload;
            console.log("All driver bookings fetched:", allBookings);

            // Organize trips by status
            const upcoming = allBookings.filter(
              (booking) =>
                booking.status === "Pending" ||
                booking.status === "pending" ||
                booking.status === "Accepted" ||
                booking.status === "accepted" ||
                booking.status === "Booked" ||
                booking.status === "booked" ||
                booking.status === "Scheduled" ||
                booking.status === "scheduled"
            );
            const completed = allBookings.filter(
              (booking) =>
                booking.status === "Completed" || booking.status === "completed"
            );

            setUpcomingTrips(upcoming);
            setCompletedTrips(completed);
            setMyTrips(allBookings);
          }
        })
        .catch((error) => {
          console.error("Error fetching driver bookings:", error);
        });
    }
  }, [dispatch, driverId, lastAction]);

  // Toggle sidebar collapse state (for desktop)
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = driverData?.fullName || driverName || "Driver";
    const nameParts = name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
    toast.custom(
      (t) => (
        <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Confirm Logout
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to logout from your account?
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleLogout();
              }}
              className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
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

  // If not authenticated, don't render the dashboard
  if (!isAuthenticated && driverId === undefined) {
    return null; // The useEffect will handle redirection
  }

  // Loading state for statistics
  if (isLoading && activeSection === "statistics") {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Loading driver stats...
          </p>
        </div>
      </div>
    );
  }

  // Shared props for all section components
  const sectionProps = {
    setActiveSection,
    upcomingTrips,
    completedTrips,
    myTrips,
    bookingsLoading,
    stats,
    statsTimeframe,
    handleTimeframeChange,
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
          {/* Mobile overlay */}
          {isSidebarOpen && isMobileView && (
            <div
              className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}

          {/* Sidebar */}
          <aside
            className={`bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen fixed top-0 left-0 z-30 transform
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
              ${collapsed ? "md:w-20" : "md:w-72"}
              md:translate-x-0 transition-all duration-300 ease-in-out
              flex flex-col shadow-lg`}
          >
            {/* Header with driver info */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {getUserInitials()}
                  </div>
                  <div className={`ml-3 ${collapsed ? "md:hidden" : ""}`}>
                    <h2 className="font-semibold text-slate-800 dark:text-white truncate max-w-[140px]">
                      {driverData?.fullName || driverName || "Driver"}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                      {driverData?.email || user?.email || "driver@example.com"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleCollapse}
                  className="hidden md:flex items-center justify-center h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronRight
                    className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${
                      collapsed ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="md:hidden flex items-center justify-center h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {!collapsed && (
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full px-4 py-2 bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 text-sm font-medium rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center"
                >
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </button>
              )}
            </div>

            {/* Sidebar navigation */}
            <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
              {!collapsed && (
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
                  Main
                </p>
              )}

              <button
                onClick={() => setActiveSection("dashboard")}
                className={`flex items-center ${
                  collapsed ? "justify-center" : ""
                } space-x-3 p-3 rounded-lg transition-all duration-200
                 ${
                   activeSection === "dashboard"
                     ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                     : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                 }`}
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                <span className={`${collapsed ? "md:hidden" : ""}`}>
                  Dashboard
                </span>
                {activeSection === "dashboard" && !collapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
                )}
              </button>

              <button
                onClick={() => setActiveSection("statistics")}
                className={`flex items-center ${
                  collapsed ? "justify-center" : ""
                } space-x-3 p-3 rounded-lg transition-all duration-200
                 ${
                   activeSection === "statistics"
                     ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                     : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                 }`}
              >
                <BarChart3 className="w-5 h-5 flex-shrink-0" />
                <span className={`${collapsed ? "md:hidden" : ""}`}>
                  Statistics
                </span>
                {activeSection === "statistics" && !collapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
                )}
              </button>

              <button
                onClick={() => setActiveSection("myratings")}
                className={`flex items-center ${
                  collapsed ? "justify-center" : ""
                } space-x-3 p-3 rounded-lg transition-all duration-200
                 ${
                   activeSection === "myratings"
                     ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                     : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                 }`}
              >
                <Star className="w-5 h-5 flex-shrink-0" />
                <span className={`${collapsed ? "md:hidden" : ""}`}>
                  My Ratings
                </span>
                {activeSection === "myratings" && !collapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
                )}
              </button>

             

            

              <button
                onClick={() => setActiveSection("earnings")}
                className={`flex items-center ${
                  collapsed ? "justify-center" : ""
                } space-x-3 p-3 rounded-lg transition-all duration-200
                 ${
                   activeSection === "earnings"
                     ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                     : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                 }`}
              >
                <Banknote className="w-5 h-5 flex-shrink-0" />
                <span className={`${collapsed ? "md:hidden" : ""}`}>
                  Earnings
                </span>
                {activeSection === "earnings" && !collapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
                )}
              </button>

              {/* <button
                onClick={() => setActiveSection("notifications")}
                className={`flex items-center ${
                  collapsed ? "justify-center" : ""
                } space-x-3 p-3 rounded-lg transition-all duration-200
                 ${
                   activeSection === "notifications"
                     ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                     : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                 }`}
              >
                <Bell className="w-5 h-5 flex-shrink-0" />
                <span className={`${collapsed ? "md:hidden" : ""}`}>
                  Notifications
                </span>
                {activeSection === "notifications" && !collapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
                )}
              </button> */}

              <button
                onClick={() => setActiveSection("manage-bookings")}
                className={`flex items-center ${
                  collapsed ? "justify-center" : ""
                } space-x-3 p-3 rounded-lg transition-all duration-200
                 ${
                   activeSection === "manage-bookings"
                     ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                     : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                 }`}
              >
                <Clock className="w-5 h-5 flex-shrink-0" />
                <span className={`${collapsed ? "md:hidden" : ""}`}>
                  Manage Bookings
                </span>
                {activeSection === "manage-bookings" && !collapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
                )}
              </button>

              {!collapsed && <></>}
            </nav>

            {/* Sidebar footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
              <button
                onClick={confirmLogout}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center" : ""
                } space-x-3 p-3 rounded-lg 
                         text-slate-700 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200`}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className={`${collapsed ? "md:hidden" : ""}`}>
                  Logout
                </span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div
            className={`flex-1 overflow-auto ${
              collapsed ? "md:ml-20" : "md:ml-72"
            } transition-all duration-300`}
          >
            {/* Header */}
            <header className="sticky top-0 z-10 flex h-16 items-center border-b border-slate-200 bg-white px-6 dark:border-slate-700 dark:bg-slate-800 shadow-sm">
              <div className="flex items-center">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="mr-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 md:hidden"
                >
                  <Menu className="h-6 w-6" />
                </button>

                <button
                  onClick={() => {
                    if (activeSection !== "dashboard") {
                      setActiveSection("dashboard");
                    } else {
                      navigate(-1);
                    }
                  }}
                  className="mr-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
                  {activeSection === "dashboard" && "Driver Dashboard"}
                  {activeSection === "statistics" && "Driver Statistics"}
                  {activeSection === "myratings" && "My Ratings"}
                  {activeSection === "upcoming" && "Upcoming Rides"}
                  {activeSection === "completed-rides" && "Completed Rides"}
                  {activeSection === "earnings" && "Earnings"}
                  {activeSection === "notifications" && "Notifications"}
                  {activeSection === "manage-bookings" && "Manage Bookings"}
                </h1>
              </div>

              <div className="ml-auto flex items-center space-x-3">
                <button
                  onClick={toggleDarkMode}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  {darkMode ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>

                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <User className="h-5 w-5" />
                </button>

                <div className="relative">
                  <button
                    onClick={() =>
                      setIsNotificationCenterOpen(!isNotificationCenterOpen)
                    }
                    className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                  >
                    <Bell className="h-5 w-5" />
                    {/* Add notification badge if needed */}
                  </button>

                  {/* Notification Center */}
                  {isNotificationCenterOpen && (
                    <NotificationCenter
                      onClose={() => setIsNotificationCenterOpen(false)}
                      isOpen={isNotificationCenterOpen}
                    />
                  )}
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="p-6 md:p-8">
              {/* Render the appropriate section based on activeSection */}
              {activeSection === "dashboard" && (
                <DashboardOverview {...sectionProps} />
              )}
              {activeSection === "statistics" && (
                <StatisticsSection {...sectionProps} />
              )}
              {activeSection === "myratings" && <MyRatings {...sectionProps} />}
              
              {activeSection === "earnings" && (
                <EarningsSection {...sectionProps} />
              )}
              {activeSection === "manage-bookings" && (
                <MyBookingsSection {...sectionProps} />
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

      {/* Toggle button for mobile (outside sidebar) */}
      <button
        className="md:hidden fixed bottom-6 right-6 z-40 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>
    </>
  );
}
