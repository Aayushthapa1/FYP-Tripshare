"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, Toaster } from "sonner";
import {
  Bell,
  Calendar,
  Car,
  CreditCard,
  Home,
  LogOut,
  Menu,
  User,
  X,
  ChevronRight,
  Ticket,
  ArrowLeft,
  ChevronDown,
  Settings,
  MapPin,
  Heart,
} from "lucide-react";
import ProfileModal from "../../auth/ProfilePage";
import { getUserProfile } from "../../Slices/userSlice";
import { logoutUser } from "../../Slices/authSlice";
import { fetchMyBookings } from "../../Slices/bookingSlice";
import NotificationCenter from "../../socket/notificationDropdown";
import {
  fetchNotifications,
  getUnreadCount,
  markAllAsRead,
  markNotificationAsRead,
} from "../../Slices/notificationSlice";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function UserDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] =
    useState(false);
  const [localNotifications, setLocalNotifications] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data from Redux auth state
  const { user } = useSelector((state) => state.auth) || {};
  const isAuthenticated = !!user?._id;
  const userId = user?._id;
  const userRole = user?.role;
  const userName = user?.userName || "User";

  // Get user profile data from Redux user state
  const userData = useSelector(
    (state) => state.user?.userData?.Result?.user_data
  );

  // Get bookings data from Redux booking state
  const {
    myBookings = [],
    loading: bookingsLoading,
    error: bookingsError,
  } = useSelector((state) => state.booking);

  // Get notifications from Redux notification state
  const {
    notifications = [],
    unreadCount = 0,
    loading: notificationsLoading,
  } = useSelector((state) => state.notification || {});

  // Generate ride stats data based on actual bookings
  const generateRideStatsData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

    if (!myBookings || myBookings.length === 0) {
      return months.map((month) => ({ name: month, rides: 0 }));
    }

    // Create a base template with all months
    const template = months.map((month) => ({ name: month, rides: 0 }));

    // Count rides per month
    myBookings.forEach((booking) => {
      if (booking.trip?.departureTime) {
        const date = new Date(booking.trip.departureTime);
        const monthIndex = date.getMonth();
        if (monthIndex < 6) {
          // Only count first 6 months
          template[monthIndex].rides += 1;
        }
      }
    });

    return template;
  };

  // Generate payment stats data based on actual bookings
  const generatePaymentStatsData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

    if (!myBookings || myBookings.length === 0) {
      return months.map((month) => ({ name: month, amount: 0 }));
    }

    // Create a base template with all months
    const template = months.map((month) => ({ name: month, amount: 0 }));

    // Sum payments per month
    myBookings.forEach((booking) => {
      if (booking.trip?.departureTime && booking.totalAmount) {
        const date = new Date(booking.trip.departureTime);
        const monthIndex = date.getMonth();
        if (monthIndex < 6) {
          // Only count first 6 months
          template[monthIndex].amount += booking.totalAmount;
        }
      }
    });

    return template;
  };

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

  // Fetch user data when component mounts
  useEffect(() => {
    if (userId) {
      dispatch(getUserProfile(userId));
      dispatch(fetchNotifications());
      dispatch(getUnreadCount());
      dispatch(fetchMyBookings());
    } else if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate("/login");
    }
  }, [dispatch, userId, isAuthenticated, navigate]);

  // Toggle sidebar collapse state (for desktop)
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = userData?.fullName || userName || "User";
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
    localStorage.removeItem("userInfo");

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

  const handleBackNavigation = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1); // Go back to the previous page
    }
  };

  const clearLocalNotifications = () => {
    setLocalNotifications([]);
  };

  const clearSingleNotification = (notificationId) => {
    setLocalNotifications(
      localNotifications.filter((notif) => notif.id !== notificationId)
    );
  };

  // If not authenticated, don't render the dashboard
  if (!isAuthenticated && userId === undefined) {
    return null; // The useEffect will handle redirection
  }

  // Calculate total rides, upcoming trips, and total spent
  const totalRides = myBookings ? myBookings.length : 0;
  const upcomingTrips = myBookings
    ? myBookings.filter(
        (b) =>
          b.status === "confirmed" ||
          b.status === "scheduled" ||
          b.status === "booked"
      ).length
    : 0;
  const totalSpent = myBookings
    ? myBookings.reduce(
        (total, booking) => total + (booking.totalAmount || 0),
        0
      )
    : 0;

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
            {/* Header with user info */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {getUserInitials()}
                  </div>
                  <div className={`ml-3 ${collapsed ? "md:hidden" : ""}`}>
                    <h2 className="font-semibold text-slate-800 dark:text-white truncate max-w-[140px]">
                      {userData?.fullName || userName || "User"}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                      {userData?.email || user?.email || "user@example.com"}
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
                onClick={() => setActiveSection("upcoming")}
                className={`flex items-center ${
                  collapsed ? "justify-center" : ""
                } space-x-3 p-3 rounded-lg transition-all duration-200
                 ${
                   activeSection === "upcoming"
                     ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                     : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                 }`}
              >
                <Calendar className="w-5 h-5 flex-shrink-0" />
                <span className={`${collapsed ? "md:hidden" : ""}`}>
                  Upcoming Trips
                </span>
                {activeSection === "upcoming" && !collapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
                )}
              </button>

              <button
                onClick={() => setActiveSection("bookings")}
                className={`flex items-center ${
                  collapsed ? "justify-center" : ""
                } space-x-3 p-3 rounded-lg transition-all duration-200
                 ${
                   activeSection === "bookings"
                     ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                     : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                 }`}
              >
                <Ticket className="w-5 h-5 flex-shrink-0" />
                <span className={`${collapsed ? "md:hidden" : ""}`}>
                  My Bookings
                </span>
                {activeSection === "bookings" && !collapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
                )}
              </button>

              <button
                onClick={() => setActiveSection("past-rides")}
                className={`flex items-center ${
                  collapsed ? "justify-center" : ""
                } space-x-3 p-3 rounded-lg transition-all duration-200
                 ${
                   activeSection === "past-rides"
                     ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                     : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                 }`}
              >
                <Car className="w-5 h-5 flex-shrink-0" />
                <span className={`${collapsed ? "md:hidden" : ""}`}>
                  Past Rides
                </span>
                {activeSection === "past-rides" && !collapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
                )}
              </button>

              <button
                onClick={() => setActiveSection("payments")}
                className={`flex items-center ${
                  collapsed ? "justify-center" : ""
                } space-x-3 p-3 rounded-lg transition-all duration-200
                 ${
                   activeSection === "payments"
                     ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                     : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                 }`}
              >
                <CreditCard className="w-5 h-5 flex-shrink-0" />
                <span className={`${collapsed ? "md:hidden" : ""}`}>
                  Payment History
                </span>
                {activeSection === "payments" && !collapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
                )}
              </button>

              <button
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
                <div className="relative">
                  <Bell className="w-5 h-5 flex-shrink-0" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className={`${collapsed ? "md:hidden" : ""}`}>
                  Notifications
                </span>
                {activeSection === "notifications" && !collapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
                )}
              </button>

              <button
                onClick={() => setActiveSection("settings")}
                className={`flex items-center ${
                  collapsed ? "justify-center" : ""
                } space-x-3 p-3 rounded-lg transition-all duration-200
                 ${
                   activeSection === "settings"
                     ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                     : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50"
                 }`}
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
                <span className={`${collapsed ? "md:hidden" : ""}`}>
                  Settings
                </span>
                {activeSection === "settings" && !collapsed && (
                  <ChevronRight className="w-4 h-4 ml-auto text-green-600 dark:text-green-400" />
                )}
              </button>
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

                {/* Back button */}
                <button
                  onClick={handleBackNavigation}
                  className="mr-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <h1 className="text-xl font-semibold text-slate-800 dark:text-white">
                  {activeSection === "dashboard" && "Dashboard"}
                  {activeSection === "upcoming" && "Upcoming Trips"}
                  {activeSection === "bookings" && "My Bookings"}
                  {activeSection === "past-rides" && "Past Rides"}
                  {activeSection === "payments" && "Payment History"}
                  {activeSection === "notifications" && "Notifications"}
                  {activeSection === "saved-locations" && "Saved Locations"}
                  {activeSection === "favorite-routes" && "Favorite Routes"}
                  {activeSection === "settings" && "Settings"}
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
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Center */}
                  {isNotificationCenterOpen && (
                    <NotificationCenter
                      onClose={() => setIsNotificationCenterOpen(false)}
                      localNotifications={localNotifications}
                      clearLocalNotifications={clearLocalNotifications}
                      clearSingleNotification={clearSingleNotification}
                      isOpen={isNotificationCenterOpen}
                    />
                  )}
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="p-6 md:p-8">
              {/* Dashboard */}
              {activeSection === "dashboard" && (
                <div className="space-y-8">
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                          <Car className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-full px-2.5 py-1">
                          Total
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Total Rides
                      </h4>
                      <p className="text-3xl font-bold text-slate-800 dark:text-white">
                        {totalRides}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                          <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-full px-2.5 py-1">
                          New
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Unread Notifications
                      </h4>
                      <p className="text-3xl font-bold text-slate-800 dark:text-white">
                        {unreadCount}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                          <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-full px-2.5 py-1">
                          Upcoming
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Upcoming Trips
                      </h4>
                      <p className="text-3xl font-bold text-slate-800 dark:text-white">
                        {upcomingTrips}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl">
                          <CreditCard className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-full px-2.5 py-1">
                          Total
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Total Spent
                      </h4>
                      <p className="text-3xl font-bold text-slate-800 dark:text-white">
                        ${totalSpent.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <h3 className="mb-6 text-lg font-semibold text-slate-800 dark:text-white">
                        Ride Statistics
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={generateRideStatsData()}>
                            <defs>
                              <linearGradient
                                id="colorRides"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#4CAF50"
                                  stopOpacity={0.8}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#4CAF50"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#f0f0f0"
                            />
                            <XAxis
                              dataKey="name"
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                borderRadius: "0.5rem",
                                border: "1px solid #e2e8f0",
                                boxShadow:
                                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="rides"
                              stroke="#4CAF50"
                              fillOpacity={1}
                              fill="url(#colorRides)"
                              strokeWidth={2}
                              activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <h3 className="mb-6 text-lg font-semibold text-slate-800 dark:text-white">
                        Payment Analytics
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={generatePaymentStatsData()}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#f0f0f0"
                            />
                            <XAxis
                              dataKey="name"
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                borderRadius: "0.5rem",
                                border: "1px solid #e2e8f0",
                                boxShadow:
                                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                              }}
                              formatter={(value) => [`$${value}`, "Amount"]}
                            />
                            <Bar
                              dataKey="amount"
                              fill="#4CAF50"
                              radius={[4, 4, 0, 0]}
                              barSize={30}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Bookings Preview */}
                  <div className="rounded-2xl bg-white shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                          Recent Bookings
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Your recent trip bookings
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveSection("bookings")}
                        className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      >
                        View All
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </button>
                    </div>

                    <div className="p-6">
                      {bookingsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-300 border-t-green-600"></div>
                        </div>
                      ) : !myBookings || myBookings.length === 0 ? (
                        <div className="py-8 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                            <Ticket className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-lg">
                            No bookings found
                          </p>
                          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                            Book your first ride to get started
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {myBookings.slice(0, 3).map((booking) => (
                            <div
                              key={booking._id}
                              className="flex flex-col rounded-xl border border-slate-200 p-5 dark:border-slate-700 hover:shadow-md transition-shadow duration-300 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    {booking.status || "Confirmed"}
                                  </span>
                                </div>
                                <h4 className="mt-2 font-medium text-slate-800 dark:text-white">
                                  {booking.trip?.departureLocation || "N/A"} →{" "}
                                  {booking.trip?.destinationLocation || "N/A"}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  Seats: {booking.seatsBooked || 1}
                                </p>
                                {booking.trip?.departureTime && (
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {new Date(
                                      booking.trip.departureTime
                                    ).toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <div className="mt-4 flex items-center gap-3 sm:mt-0">
                                <p className="font-medium text-slate-800 dark:text-white">
                                  ${booking.totalAmount || "N/A"}
                                </p>
                                <button
                                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                                  onClick={() =>
                                    navigate(`/bookings/${booking._id}`)
                                  }
                                >
                                  Details
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notifications Preview */}
                  <div className="rounded-2xl bg-white shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                          Recent Notifications
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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

                    <div className="p-6">
                      {notificationsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-300 border-t-green-600"></div>
                        </div>
                      ) : !notifications || notifications.length === 0 ? (
                        <div className="py-8 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                            <Bell className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-lg">
                            No notifications found
                          </p>
                          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                            You're all caught up!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {notifications.slice(0, 3).map((notification) => (
                            <div
                              key={notification._id}
                              className={`flex items-start gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700 ${
                                !notification.isRead &&
                                !notification.readBy?.includes(userId)
                                  ? "bg-slate-50 dark:bg-slate-700/50"
                                  : ""
                              } hover:shadow-sm transition-shadow duration-300`}
                            >
                              <div
                                className={`mt-1 flex-shrink-0 rounded-full p-2 ${
                                  !notification.isRead &&
                                  !notification.readBy?.includes(userId)
                                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                                }`}
                              >
                                <Bell className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p
                                  className={`text-sm ${
                                    !notification.isRead &&
                                    !notification.readBy?.includes(userId)
                                      ? "font-medium text-slate-800 dark:text-white"
                                      : "text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  {notification.message}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Upcoming Trips Section */}
              {activeSection === "upcoming" && (
                <div className="space-y-6">
                  {/* Back to Dashboard button */}
                  <div className="mb-4">
                    <button
                      onClick={() => setActiveSection("dashboard")}
                      className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Back to Dashboard
                    </button>
                  </div>
                  <div className="rounded-xl bg-white shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="border-b border-slate-200 p-6 dark:border-slate-700">
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                        Upcoming Trips
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        All your scheduled rides
                      </p>
                    </div>

                    <div className="p-6">
                      {bookingsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-300 border-t-green-600"></div>
                        </div>
                      ) : !myBookings ||
                        myBookings.length === 0 ||
                        !myBookings.some(
                          (b) =>
                            b.status === "confirmed" ||
                            b.status === "scheduled" ||
                            b.status === "booked"
                        ) ? (
                        <div className="py-8 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                            <Calendar className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-lg">
                            No upcoming trips scheduled
                          </p>
                          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                            Book a ride to see it here
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myBookings
                            .filter(
                              (b) =>
                                b.status === "confirmed" ||
                                b.status === "scheduled" ||
                                b.status === "booked"
                            )
                            .map((booking) => (
                              <div
                                key={booking._id}
                                className="flex flex-col rounded-xl border border-slate-200 p-5 dark:border-slate-700 hover:shadow-md transition-shadow duration-300 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    {booking.trip?.departureTime && (
                                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                                        {new Date(
                                          booking.trip.departureTime
                                        ).toLocaleDateString()}{" "}
                                        •{" "}
                                        {new Date(
                                          booking.trip.departureTime
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    )}
                                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                      {booking.status}
                                    </span>
                                  </div>
                                  <h4 className="mt-2 font-medium text-slate-800 dark:text-white">
                                    {booking.trip?.departureLocation || "N/A"} →{" "}
                                    {booking.trip?.destinationLocation || "N/A"}
                                  </h4>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Seats: {booking.seatsBooked || 1}
                                  </p>
                                  {booking.trip?.driverName && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      Driver: {booking.trip.driverName}
                                    </p>
                                  )}
                                </div>
                                <div className="mt-4 flex items-center gap-2 sm:mt-0">
                                  <p className="font-medium text-slate-800 dark:text-white">
                                    ${booking.totalAmount || "N/A"}
                                  </p>
                                  <div className="flex gap-2">
                                    <button
                                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                                      onClick={() => {
                                        // Handle cancellation logic here
                                        toast.info(
                                          "Cancellation functionality would be implemented here"
                                        );
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                                      onClick={() =>
                                        navigate(`/bookings/${booking._id}`)
                                      }
                                    >
                                      Details
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* My Bookings Section */}
              {activeSection === "bookings" && (
                <div className="space-y-6">
                  {/* Back to Dashboard button */}
                  <div className="mb-4">
                    <button
                      onClick={() => setActiveSection("dashboard")}
                      className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Back to Dashboard
                    </button>
                  </div>
                  <div className="rounded-xl bg-white shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="border-b border-slate-200 p-6 dark:border-slate-700">
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                        My Bookings
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        All your booked trips
                      </p>
                    </div>

                    <div className="p-6">
                      {bookingsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-300 border-t-green-600"></div>
                        </div>
                      ) : bookingsError ? (
                        <div className="py-8 text-center">
                          <p className="text-red-500 dark:text-red-400">
                            Error loading bookings: {bookingsError}
                          </p>
                          <button
                            onClick={() => dispatch(fetchMyBookings())}
                            className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
                          >
                            Try Again
                          </button>
                        </div>
                      ) : !myBookings || myBookings.length === 0 ? (
                        <div className="py-8 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                            <Ticket className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-lg">
                            No bookings found
                          </p>
                          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                            Book your first ride to get started
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myBookings.map((booking) => (
                            <div
                              key={booking._id}
                              className="flex flex-col rounded-xl border border-slate-200 p-5 dark:border-slate-700 hover:shadow-md transition-shadow duration-300 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    {booking.status || "Confirmed"}
                                  </span>
                                </div>
                                <h4 className="mt-2 font-medium text-slate-800 dark:text-white">
                                  {booking.trip?.departureLocation || "N/A"} →{" "}
                                  {booking.trip?.destinationLocation || "N/A"}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  Seats: {booking.seatsBooked || 1}
                                </p>
                                {booking.trip?.departureTime && (
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Departure:{" "}
                                    {new Date(
                                      booking.trip.departureTime
                                    ).toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <div className="mt-4 flex items-center gap-2 sm:mt-0">
                                <p className="font-medium text-slate-800 dark:text-white">
                                  ${booking.totalAmount || "N/A"}
                                </p>
                                <button
                                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                                  onClick={() =>
                                    navigate(`/bookings/${booking._id}`)
                                  }
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Past Rides Section */}
              {activeSection === "past-rides" && (
                <div className="space-y-6">
                  {/* Back to Dashboard button */}
                  <div className="mb-4">
                    <button
                      onClick={() => setActiveSection("dashboard")}
                      className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Back to Dashboard
                    </button>
                  </div>
                  <div className="rounded-xl bg-white shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="border-b border-slate-200 p-6 dark:border-slate-700">
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                        Past Rides
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        History of your rides
                      </p>
                    </div>

                    <div className="p-6">
                      {bookingsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-300 border-t-green-600"></div>
                        </div>
                      ) : !myBookings ||
                        myBookings.length === 0 ||
                        !myBookings.some((b) => b.status === "completed") ? (
                        <div className="py-8 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                            <Car className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-lg">
                            No past rides found
                          </p>
                          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                            Your completed rides will appear here
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myBookings
                            .filter((b) => b.status === "completed")
                            .map((booking) => (
                              <div
                                key={booking._id}
                                className="flex flex-col rounded-xl border border-slate-200 p-5 dark:border-slate-700 hover:shadow-md transition-shadow duration-300 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div>
                                  {booking.trip?.departureTime && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      {new Date(
                                        booking.trip.departureTime
                                      ).toLocaleDateString()}
                                    </p>
                                  )}
                                  <h4 className="mt-1 font-medium text-slate-800 dark:text-white">
                                    {booking.trip?.departureLocation || "N/A"} →{" "}
                                    {booking.trip?.destinationLocation || "N/A"}
                                  </h4>
                                  {booking.trip?.driverName && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      Driver: {booking.trip.driverName}
                                    </p>
                                  )}
                                </div>
                                <div className="mt-4 flex items-center gap-4 sm:mt-0">
                                  <div className="flex items-center">
                                    <p className="mr-2 font-medium text-slate-800 dark:text-white">
                                      ${booking.totalAmount || "N/A"}
                                    </p>
                                    {booking.rating && (
                                      <div className="flex items-center">
                                        <span className="mr-1 text-sm text-slate-500 dark:text-slate-400">
                                          Rating:
                                        </span>
                                        <span className="text-yellow-500">
                                          {"★".repeat(booking.rating)}
                                          {"☆".repeat(5 - booking.rating)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    onClick={() =>
                                      navigate(`/bookings/${booking._id}`)
                                    }
                                  >
                                    Receipt
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Payments Section */}
              {activeSection === "payments" && (
                <div className="space-y-6">
                  {/* Back to Dashboard button */}
                  <div className="mb-4">
                    <button
                      onClick={() => setActiveSection("dashboard")}
                      className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Back to Dashboard
                    </button>
                  </div>
                  <div className="rounded-xl bg-white shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="border-b border-slate-200 p-6 dark:border-slate-700">
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                        Payment History
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Record of your payments
                      </p>
                    </div>

                    <div className="p-6">
                      {bookingsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-300 border-t-green-600"></div>
                        </div>
                      ) : !myBookings ||
                        myBookings.length === 0 ||
                        !myBookings.some(
                          (b) => b.paymentStatus === "completed"
                        ) ? (
                        <div className="py-8 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                            <CreditCard className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-lg">
                            No payment records found
                          </p>
                          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                            Your payment history will appear here
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myBookings
                            .filter((b) => b.paymentStatus === "completed")
                            .map((booking) => (
                              <div
                                key={booking._id}
                                className="flex flex-col rounded-xl border border-slate-200 p-5 dark:border-slate-700 hover:shadow-md transition-shadow duration-300 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div>
                                  {booking.paymentDate ? (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      {new Date(
                                        booking.paymentDate
                                      ).toLocaleDateString()}
                                    </p>
                                  ) : (
                                    booking.trip?.departureTime && (
                                      <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(
                                          booking.trip.departureTime
                                        ).toLocaleDateString()}
                                      </p>
                                    )
                                  )}
                                  <h4 className="mt-1 font-medium text-slate-800 dark:text-white">
                                    ${booking.totalAmount || "N/A"}
                                  </h4>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Method:{" "}
                                    {booking.paymentMethod || "Credit Card"}
                                  </p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 sm:mt-0">
                                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    {booking.paymentStatus || "Completed"}
                                  </span>
                                  <button
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                                    onClick={() => {
                                      // Handle download logic here
                                      toast.info(
                                        "Download receipt functionality would be implemented here"
                                      );
                                    }}
                                  >
                                    Download
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <div className="space-y-6">
                  {/* Back to Dashboard button */}
                  <div className="mb-4">
                    <button
                      onClick={() => setActiveSection("dashboard")}
                      className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Back to Dashboard
                    </button>
                  </div>
                  <div className="rounded-xl bg-white shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="border-b border-slate-200 p-6 dark:border-slate-700">
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                        Notifications
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Stay updated with your activity
                      </p>
                    </div>

                    <div className="p-6">
                      <div className="mb-4 flex justify-end">
                        <button
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                          onClick={() => {
                            // Mark all notifications as read
                            dispatch(markAllAsRead())
                              .then(() => {
                                toast.success(
                                  "All notifications marked as read"
                                );
                                dispatch(getUnreadCount());
                              })
                              .catch((err) => {
                                toast.error(
                                  "Failed to mark notifications as read"
                                );
                              });
                          }}
                        >
                          Mark All as Read
                        </button>
                      </div>

                      <div className="mb-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex space-x-4">
                          <button className="border-b-2 border-green-600 px-4 py-2 text-sm font-medium text-green-600 dark:border-green-400 dark:text-green-400">
                            All
                          </button>
                          <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                            Unread
                          </button>
                        </div>
                      </div>

                      {notificationsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-300 border-t-green-600"></div>
                        </div>
                      ) : !notifications || notifications.length === 0 ? (
                        <div className="py-8 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                            <Bell className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-lg">
                            No notifications found
                          </p>
                          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                            You're all caught up!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {notifications.map((notification) => (
                            <div
                              key={notification._id}
                              className={`flex items-start gap-4 rounded-xl border border-slate-200 p-5 dark:border-slate-700 ${
                                !notification.isRead &&
                                !notification.readBy?.includes(userId)
                                  ? "bg-slate-50 dark:bg-slate-700/50"
                                  : ""
                              } hover:shadow-md transition-shadow duration-300`}
                            >
                              <div
                                className={`mt-1 flex-shrink-0 rounded-full p-2 ${
                                  !notification.isRead &&
                                  !notification.readBy?.includes(userId)
                                    ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                                }`}
                              >
                                <Bell className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <p
                                  className={`text-sm ${
                                    !notification.isRead &&
                                    !notification.readBy?.includes(userId)
                                      ? "font-medium text-slate-800 dark:text-white"
                                      : "text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  {notification.message}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString()}
                                </p>
                              </div>
                              {!notification.isRead &&
                                !notification.readBy?.includes(userId) && (
                                  <button
                                    className="rounded-lg px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                                    onClick={() => {
                                      // Mark notification as read
                                      dispatch(
                                        markNotificationAsRead(notification._id)
                                      )
                                        .then(() => {
                                          toast.success(
                                            "Notification marked as read"
                                          );
                                          dispatch(getUnreadCount());
                                        })
                                        .catch((err) => {
                                          toast.error(
                                            "Failed to mark notification as read"
                                          );
                                        });
                                    }}
                                  >
                                    Mark as Read
                                  </button>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Section */}
              {activeSection === "settings" && (
                <div className="space-y-6">
                  {/* Back to Dashboard button */}
                  <div className="mb-4">
                    <button
                      onClick={() => setActiveSection("dashboard")}
                      className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Back to Dashboard
                    </button>
                  </div>
                  <div className="rounded-xl bg-white shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="border-b border-slate-200 p-6 dark:border-slate-700">
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                        Settings
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage your account settings
                      </p>
                    </div>

                    <div className="p-6">
                      <div className="space-y-8">
                        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                          <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">
                            Profile Information
                          </h3>
                          <button
                            className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors"
                            onClick={() => setIsProfileModalOpen(true)}
                          >
                            Edit Profile
                          </button>
                        </div>

                        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                          <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">
                            Display Settings
                          </h3>
                          <button
                            onClick={toggleDarkMode}
                            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                          >
                            {darkMode
                              ? "Switch to Light Mode"
                              : "Switch to Dark Mode"}
                          </button>
                        </div>

                        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                          <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">
                            Account Actions
                          </h3>
                          <button
                            onClick={confirmLogout}
                            className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </div>
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
          userId={userId}
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
