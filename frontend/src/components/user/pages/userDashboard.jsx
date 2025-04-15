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
  Heart,
  Home,
  LogOut,
  MapPin,
  Menu,
  Settings,
  User,
  X,
  ChevronRight,
  Ticket,
  ArrowLeft,
} from "lucide-react";
import ProfileModal from "../../auth/ProfilePage";
import { getUserProfile } from "../../Slices/userSlice";
import { logoutUser } from "../../Slices/authSlice";
import { fetchMyBookings } from "../../Slices/bookingSlice";
import NotificationCenter from "../../socket/notificationDropdown"; // Import the NotificationCenter component
import { fetchNotifications, getUnreadCount } from "../../Slices/notificationSlice";
import Chart from 'chart.js/auto';

export default function UserDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState([]);
  const [rideStatsChart, setRideStatsChart] = useState(null);
  const [paymentStatsChart, setPaymentStatsChart] = useState(null);

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
    myBookings,
    loading: bookingsLoading,
    error: bookingsError,
  } = useSelector((state) => state.booking);

  // Get notifications from Redux notification state
  const { 
    notifications = [], 
    unreadCount = 0,
    loading: notificationsLoading 
  } = useSelector((state) => state.notification || {});

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
    } else if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate("/login");
    }
  }, [dispatch, userId, isAuthenticated, navigate]);

  // Fetch bookings data when the bookings section is active
  useEffect(() => {
    if (activeSection === "bookings") {
      dispatch(fetchMyBookings());
    }
  }, [dispatch, activeSection]);

  // Initialize charts when component mounts or when data changes
  useEffect(() => {
    // Clean up previous charts to prevent memory leaks
    if (rideStatsChart) {
      rideStatsChart.destroy();
    }
    if (paymentStatsChart) {
      paymentStatsChart.destroy();
    }

    // Only initialize charts on dashboard section
    if (activeSection === "dashboard") {
      // Initialize ride stats chart
      const rideChartCanvas = document.getElementById('rideStatsChart');
      if (rideChartCanvas) {
        const ctx = rideChartCanvas.getContext('2d');
        const newRideChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Rides Taken',
              data: myBookings ? [myBookings.length, myBookings.length + 2, myBookings.length + 1, myBookings.length + 3, myBookings.length, myBookings.length + 2] : [0, 0, 0, 0, 0, 0],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Ride Statistics'
              }
            }
          }
        });
        setRideStatsChart(newRideChart);
      }

      // Initialize payment stats chart
      const paymentChartCanvas = document.getElementById('paymentStatsChart');
      if (paymentChartCanvas) {
        const ctx = paymentChartCanvas.getContext('2d');
        const newPaymentChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Monthly Spending ($)',
              data: [25, 30, 45, 35, 40, 50],
              backgroundColor: '#3b82f6',
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Payment Statistics'
              }
            }
          }
        });
        setPaymentStatsChart(newPaymentChart);
      }
    }

    // Clean up charts when component unmounts
    return () => {
      if (rideStatsChart) {
        rideStatsChart.destroy();
      }
      if (paymentStatsChart) {
        paymentStatsChart.destroy();
      }
    };
  }, [activeSection, myBookings]);

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
    setLocalNotifications(localNotifications.filter(
      (notif) => notif.id !== notificationId
    ));
  };

  // If not authenticated, don't render the dashboard
  if (!isAuthenticated && userId === undefined) {
    return null; // The useEffect will handle redirection
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
            {/* User profile section */}
            <div className="mb-6 flex items-center space-x-3 border-b border-gray-200 pb-4 dark:border-gray-700">
              <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                {userData?.fullName
                  ? userData.fullName
                      .split(" ")
                      .map((name) => name[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {userData?.fullName || userName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {userData?.email || user?.email || ""}
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
                    onClick={() => setActiveSection("upcoming")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                      activeSection === "upcoming"
                        ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Calendar className="mr-3 h-5 w-5" />
                    Upcoming Trips
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("bookings")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                      activeSection === "bookings"
                        ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Ticket className="mr-3 h-5 w-5" />
                    My Bookings
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("past-rides")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                      activeSection === "past-rides"
                        ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Car className="mr-3 h-5 w-5" />
                    Past Rides
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("payments")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                      activeSection === "payments"
                        ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <CreditCard className="mr-3 h-5 w-5" />
                    Payment History
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
                    {unreadCount > 0 && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </li>
              </ul>
            </div>

           

            {/* Logout button - Positioned at the bottom */}
            <div className="mt-auto border-t border-gray-200 pt-4 dark:border-gray-700 absolute bottom-4 left-0 right-0 px-4">
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
              <div className="flex items-center">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="mr-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 md:hidden"
                >
                  <Menu className="h-6 w-6" />
                </button>
                
                {/* Back button */}
                <button
                  onClick={handleBackNavigation}
                  className="mr-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
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

              <div className="ml-auto flex items-center space-x-2">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <User className="h-5 w-5" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
                    className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
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
            <main className="p-4 md:p-6">
              {/* Dashboard */}
              {activeSection === "dashboard" && (
                <div className="space-y-6">
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                      <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Rides
                      </h4>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {myBookings ? myBookings.length : 0}
                      </p>
                    </div>
                    
                    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                      <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Unread Notifications
                      </h4>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {unreadCount}
                      </p>
                    </div>
                    
                    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                      <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Upcoming Trips
                      </h4>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {myBookings ? myBookings.filter(b => 
                          b.status === 'confirmed' || b.status === 'scheduled'
                        ).length : 0}
                      </p>
                    </div>
                    
                    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                      <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total Spent
                      </h4>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                        ${myBookings ? myBookings.reduce((total, booking) => 
                          total + (booking.totalAmount || 0), 0) : 0}
                      </p>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                      <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                        Ride Statistics
                      </h3>
                      <div className="h-64">
                        <canvas id="rideStatsChart"></canvas>
                      </div>
                    </div>
                    
                    <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                      <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                        Payment Analytics
                      </h3>
                      <div className="h-64">
                        <canvas id="paymentStatsChart"></canvas>
                      </div>
                    </div>
                  </div>

                  {/* Bookings Preview */}
                  <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                          Recent Bookings
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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

                    <div className="p-4">
                      {bookingsLoading ? (
                        <div className="flex justify-center py-4">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600"></div>
                        </div>
                      ) : !myBookings || myBookings.length === 0 ? (
                        <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                          No bookings found
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {myBookings.slice(0, 3).map((booking) => (
                            <div
                              key={booking._id}
                              className="flex flex-col rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    {booking.status || "Confirmed"}
                                  </span>
                                </div>
                                <h4 className="mt-2 font-medium text-gray-900 dark:text-white">
                                  {booking.trip?.departureLocation || "N/A"} → {booking.trip?.destinationLocation || "N/A"}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Seats: {booking.seatsBooked || 1}
                                </p>
                                {booking.trip?.departureTime && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(booking.trip.departureTime).toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <div className="mt-4 flex items-center gap-2 sm:mt-0">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  ${booking.totalAmount || "N/A"}
                                </p>
                                <button 
                                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                  onClick={() => navigate(`/bookings/${booking._id}`)}
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
                  <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                          Recent Notifications
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
                      {notificationsLoading ? (
                        <div className="flex justify-center py-4">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-green-600"></div>
                        </div>
                      ) : !notifications || notifications.length === 0 ? (
                        <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                          No notifications found
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {notifications.slice(0, 3).map((notification) => (
                            <div
                              key={notification._id}
                              className={`flex items-start gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700 ${
                                !notification.isRead && !notification.readBy?.includes(userId)
                                  ? "bg-gray-50 dark:bg-gray-700/50"
                                  : ""
                              }`}
                            >
                              <Bell className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                              <div>
                                <p className={`text-sm ${
                                  !notification.isRead && !notification.readBy?.includes(userId)
                                    ? "font-medium text-gray-900 dark:text-white"
                                    : "text-gray-700 dark:text-gray-300"
                                }`}>
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(notification.createdAt).toLocaleString()}
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
                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Upcoming Trips
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      All your scheduled rides
                    </p>
                  </div>

                  <div className="p-4">
                    {bookingsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-600"></div>
                      </div>
                    ) : !myBookings || myBookings.length === 0 || 
                        !myBookings.some(b => b.status === 'confirmed' || b.status === 'scheduled') ? (
                      <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No upcoming trips scheduled
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {myBookings
                          .filter(b => b.status === 'confirmed' || b.status === 'scheduled')
                          .map((booking) => (
                            <div
                              key={booking._id}
                              className="flex flex-col rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {booking.trip?.departureTime && (
                                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                      {new Date(booking.trip.departureTime).toLocaleDateString()} • 
                                      {new Date(booking.trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                  )}
                                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    {booking.status}
                                  </span>
                                </div>
                                <h4 className="mt-2 font-medium text-gray-900 dark:text-white">
                                  {booking.trip?.departureLocation || "N/A"} → {booking.trip?.destinationLocation || "N/A"}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Seats: {booking.seatsBooked || 1}
                                </p>
                                {booking.trip?.driverName && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Driver: {booking.trip.driverName}
                                  </p>
                                )}
                              </div>
                              <div className="mt-4 flex items-center gap-2 sm:mt-0">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  ${booking.totalAmount || "N/A"}
                                </p>
                                <div className="flex gap-2">
                                  <button 
                                    className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                                    onClick={() => {
                                      // Handle cancellation logic here
                                      toast.info("Cancellation functionality would be implemented here");
                                    }}
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                    onClick={() => navigate(`/bookings/${booking._id}`)}
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
              )}

              {/* My Bookings Section */}
              {activeSection === "bookings" && (
                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      My Bookings
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      All your booked trips
                    </p>
                  </div>

                  <div className="p-4">
                    {bookingsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-600"></div>
                      </div>
                    ) : bookingsError ? (
                      <div className="py-8 text-center">
                        <p className="text-red-500 dark:text-red-400">
                          Error loading bookings: {bookingsError}
                        </p>
                        <button
                          onClick={() => dispatch(fetchMyBookings())}
                          className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : !myBookings || myBookings.length === 0 ? (
                      <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No bookings found
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {myBookings.map((booking) => (
                          <div
                            key={booking._id}
                            className="flex flex-col rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  {booking.status || "Confirmed"}
                                </span>
                              </div>
                              <h4 className="mt-2 font-medium text-gray-900 dark:text-white">
                                {booking.trip?.departureLocation || "N/A"} → {booking.trip?.destinationLocation || "N/A"}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Seats: {booking.seatsBooked || 1}
                              </p>
                              {booking.trip?.departureTime && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Departure: {new Date(booking.trip.departureTime).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="mt-4 flex items-center gap-2 sm:mt-0">
                              <p className="font-medium text-gray-900 dark:text-white">
                                ${booking.totalAmount || "N/A"}
                              </p>
                              <button 
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                onClick={() => navigate(`/bookings/${booking._id}`)}
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
              )}

              {/* Past Rides Section */}
              {activeSection === "past-rides" && (
                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Past Rides
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      History of your rides
                    </p>
                  </div>

                  <div className="p-4">
                    {bookingsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-600"></div>
                      </div>
                    ) : !myBookings || myBookings.length === 0 || 
                        !myBookings.some(b => b.status === 'completed') ? (
                      <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No past rides found
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {myBookings
                          .filter(b => b.status === 'completed')
                          .map((booking) => (
                            <div
                              key={booking._id}
                              className="flex flex-col rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                {booking.trip?.departureTime && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(booking.trip.departureTime).toLocaleDateString()}
                                  </p>
                                )}
                                <h4 className="mt-1 font-medium text-gray-900 dark:text-white">
                                  {booking.trip?.departureLocation || "N/A"} → {booking.trip?.destinationLocation || "N/A"}
                                </h4>
                                {booking.trip?.driverName && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Driver: {booking.trip.driverName}
                                  </p>
                                )}
                              </div>
                              <div className="mt-4 flex items-center gap-4 sm:mt-0">
                                <div className="flex items-center">
                                  <p className="mr-2 font-medium text-gray-900 dark:text-white">
                                    ${booking.totalAmount || "N/A"}
                                  </p>
                                  {booking.rating && (
                                    <div className="flex items-center">
                                      <span className="mr-1 text-sm text-gray-500 dark:text-gray-400">
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
                                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                  onClick={() => navigate(`/bookings/${booking._id}`)}
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
              )}

              {/* Payments Section */}
              {activeSection === "payments" && (
                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Payment History
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Record of your payments
                    </p>
                  </div>

                  <div className="p-4">
                    {bookingsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-600"></div>
                      </div>
                    ) : !myBookings || myBookings.length === 0 || 
                        !myBookings.some(b => b.paymentStatus === 'completed') ? (
                      <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No payment records found
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {myBookings
                          .filter(b => b.paymentStatus === 'completed')
                          .map((booking) => (
                            <div
                              key={booking._id}
                              className="flex flex-col rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                {booking.paymentDate ? (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(booking.paymentDate).toLocaleDateString()}
                                  </p>
                                ) : booking.trip?.departureTime && (
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(booking.trip.departureTime).toLocaleDateString()}
                                  </p>
                                )}
                                <h4 className="mt-1 font-medium text-gray-900 dark:text-white">
                                  ${booking.totalAmount || "N/A"}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Method: {booking.paymentMethod || "Credit Card"}
                                </p>
                              </div>
                              <div className="mt-4 flex items-center gap-2 sm:mt-0">
                                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                  {booking.paymentStatus || "Completed"}
                                </span>
                                <button 
                                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                  onClick={() => {
                                    // Handle download logic here
                                    toast.info("Download receipt functionality would be implemented here");
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
                      <button 
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        onClick={() => {
                          // Mark all notifications as read
                          dispatch(markAllAsRead())
                            .then(() => {
                              toast.success("All notifications marked as read");
                              dispatch(getUnreadCount());
                            })
                            .catch(err => {
                              toast.error("Failed to mark notifications as read");
                            });
                        }}
                      >
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

                    {notificationsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-green-600"></div>
                      </div>
                    ) : !notifications || notifications.length === 0 ? (
                      <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No notifications found
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`flex items-start gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700 ${
                              !notification.isRead && !notification.readBy?.includes(userId)
                                ? "bg-gray-50 dark:bg-gray-700/50"
                                : ""
                            }`}
                          >
                            <Bell className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                            <div className="flex-1">
                              <p className={`text-sm ${
                                !notification.isRead && !notification.readBy?.includes(userId)
                                  ? "font-medium text-gray-900 dark:text-white"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {(!notification.isRead && !notification.readBy?.includes(userId)) && (
                              <button 
                                className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                                onClick={() => {
                                  // Mark notification as read
                                  dispatch(markNotificationAsRead(notification._id))
                                    .then(() => {
                                      toast.success("Notification marked as read");
                                      dispatch(getUnreadCount());
                                    })
                                    .catch(err => {
                                      toast.error("Failed to mark notification as read");
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
              )}

              {/* Saved Locations Section */}
              {activeSection === "saved-locations" && (
                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Saved Locations
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Manage your saved locations
                    </p>
                  </div>

                  <div className="p-4">
                    <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                      You have no saved locations yet
                    </p>
                  </div>
                </div>
              )}

              {/* Favorite Routes Section */}
              {activeSection === "favorite-routes" && (
                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                      Favorite Routes
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Manage your favorite routes
                    </p>
                  </div>

                  <div className="p-4">
                    <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                      You have no favorite routes yet
                    </p>
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
                      Manage your account settings
                    </p>
                  </div>

                  <div className="p-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-md font-medium text-gray-900 dark:text-white">
                          Profile Information
                        </h3>
                        <button 
                          className="mt-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                          onClick={() => setIsProfileModalOpen(true)}
                        >
                          Edit Profile
                        </button>
                      </div>

                      <div>
                        <h3 className="text-md font-medium text-gray-900 dark:text-white">
                          Dark Mode
                        </h3>
                        <button
                          onClick={toggleDarkMode}
                          className="mt-2 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                        >
                          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        </button>
                      </div>

                      <div>
                        <h3 className="text-md font-medium text-gray-900 dark:text-white">
                          Account Actions
                        </h3>
                        <button
                          onClick={confirmLogout}
                          className="mt-2 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </button>
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
    </>
  );
}