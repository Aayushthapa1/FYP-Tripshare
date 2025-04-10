"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import ProfileModal from "../../auth/ProfileModal";
import { getUserProfile } from "../../Slices/userSlice";
import { logoutUser } from "../../Slices/authSlice";
import { fetchMyBookings } from "../../Slices/bookingSlice";

export default function UserDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  // Dummy data for dashboard
  const upcomingRides = [
    {
      id: 1,
      date: "2025-03-26",
      time: "09:30 AM",
      from: "Home",
      to: "Office",
      status: "Scheduled",
      driver: "John Doe",
      cost: "$15",
    },
    {
      id: 2,
      date: "2025-03-27",
      time: "06:00 PM",
      from: "Office",
      to: "Home",
      status: "Scheduled",
      driver: "Sarah Smith",
      cost: "$15",
    },
  ];

  const pastRides = [
    {
      id: 1,
      date: "2025-03-25",
      from: "Home",
      to: "Office",
      driver: "Michael Brown",
      rating: 5,
      cost: "$15",
    },
    {
      id: 2,
      date: "2025-03-24",
      from: "Office",
      to: "Gym",
      driver: "Emma Wilson",
      rating: 4,
      cost: "$10",
    },
    {
      id: 3,
      date: "2025-03-23",
      from: "Gym",
      to: "Home",
      driver: "David Lee",
      rating: 5,
      cost: "$12",
    },
  ];

  const payments = [
    {
      id: 1,
      date: "2025-03-25",
      amount: "$15",
      method: "Credit Card",
      status: "Completed",
    },
    {
      id: 2,
      date: "2025-03-24",
      amount: "$10",
      method: "PayPal",
      status: "Completed",
    },
    {
      id: 3,
      date: "2025-03-23",
      amount: "$12",
      method: "Credit Card",
      status: "Completed",
    },
  ];

  const notifications = [
    {
      id: 1,
      message: "Your ride has been confirmed for tomorrow at 9:30 AM",
      time: "2 hours ago",
      isRead: false,
    },
    {
      id: 2,
      message: "Driver John is 5 minutes away",
      time: "1 day ago",
      isRead: true,
    },
    {
      id: 3,
      message: "Payment of $15 processed successfully",
      time: "2 days ago",
      isRead: true,
    },
    {
      id: 4,
      message: "Rate your last ride with Emma",
      time: "3 days ago",
      isRead: false,
    },
  ];

  const savedLocations = [
    { id: 1, name: "Home", address: "123 Main St, Anytown", type: "home" },
    {
      id: 2,
      name: "Office",
      address: "456 Business Ave, Downtown",
      type: "work",
    },
    {
      id: 3,
      name: "Gym",
      address: "789 Fitness Blvd, Westside",
      type: "other",
    },
  ];

  const favoriteRoutes = [
    {
      id: 1,
      name: "Home to Office",
      from: "Home",
      to: "Office",
      frequency: "Weekdays",
    },
    {
      id: 2,
      name: "Office to Home",
      from: "Office",
      to: "Home",
      frequency: "Weekdays",
    },
    {
      id: 3,
      name: "Home to Gym",
      from: "Home",
      to: "Gym",
      frequency: "Weekends",
    },
  ];

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
                    onClick={() => setActiveSection("saved-locations")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                      activeSection === "saved-locations"
                        ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <MapPin className="mr-3 h-5 w-5" />
                    Saved Locations
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("favorite-routes")}
                    className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${
                      activeSection === "favorite-routes"
                        ? "bg-green-50 text-green-600 font-medium dark:bg-green-900/30 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Heart className="mr-3 h-5 w-5" />
                    Favorite Routes
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
                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        Book a Ride
                      </h3>
                      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Need to go somewhere?
                      </p>
                      <button className="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                        Book Now
                      </button>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        Schedule a Ride
                      </h3>
                      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Plan ahead for your trip
                      </p>
                      <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                        Schedule
                      </button>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                      <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        Add Payment
                      </h3>
                      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Add a new payment method
                      </p>
                      <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                        Add Method
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

                  {/* Upcoming Rides */}
                  <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                          Upcoming Rides
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Your scheduled rides
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
                      {upcomingRides.length > 0 ? (
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
                                  Driver: {ride.driver}
                                </p>
                              </div>
                              <div className="mt-4 flex items-center gap-2 sm:mt-0">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {ride.cost}
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
                    {/* Past Rides */}
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
                          onClick={() => setActiveSection("past-rides")}
                          className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        >
                          View All
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="space-y-4">
                          {pastRides.slice(0, 2).map((ride) => (
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
                              </div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {ride.cost}
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
                      All your scheduled rides
                    </p>
                  </div>

                  <div className="p-4">
                    {upcomingRides.length > 0 ? (
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
                                Driver: {ride.driver}
                              </p>
                            </div>
                            <div className="mt-4 flex items-center gap-2 sm:mt-0">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {ride.cost}
                              </p>
                              <div className="flex gap-2">
                                <button className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700">
                                  Cancel
                                </button>
                                <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                  Reschedule
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
                        <span className="sr-only">Loading bookings...</span>
                      </div>
                    ) : bookingsError ? (
                      <div className="py-8 text-center">
                        <p className="text-red-500 dark:text-red-400">
                          Error loading bookings: {bookingsError}
                        </p>
                        <button
                          onClick={() => dispatch(getMyBookings())}
                          className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : myBookings && myBookings.length > 0 ? (
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
                                {booking.trip?.departureLocation} →{" "}
                                {booking.trip?.destinationLocation}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Seats: {booking.seatsBooked}
                              </p>
                              {booking.trip?.departureTime && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Departure:{" "}
                                  {new Date(
                                    booking.trip.departureTime
                                  ).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="mt-4 flex items-center gap-2 sm:mt-0">
                              {booking.totalAmount && (
                                <p className="font-medium text-gray-900 dark:text-white">
                                  ${booking.totalAmount}
                                </p>
                              )}
                              <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No bookings found.
                      </p>
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
                    <div className="space-y-4">
                      {pastRides.map((ride) => (
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
                              Driver: {ride.driver}
                            </p>
                          </div>
                          <div className="mt-4 flex items-center gap-4 sm:mt-0">
                            <div className="flex items-center">
                              <p className="mr-2 font-medium text-gray-900 dark:text-white">
                                {ride.cost}
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
                              Receipt
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
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
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex flex-col rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {payment.date}
                            </p>
                            <h4 className="mt-1 font-medium text-gray-900 dark:text-white">
                              {payment.amount}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Method: {payment.method}
                            </p>
                          </div>
                          <div className="mt-4 flex items-center gap-2 sm:mt-0">
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              {payment.status}
                            </span>
                            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                              Download
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

              {/* Saved Locations Section */}
              {activeSection === "saved-locations" && (
                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Saved Locations
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
                      {savedLocations.map((location) => (
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
                              Edit
                            </button>
                            <button className="rounded-lg border border-red-300 bg-white px-3 py-1 text-sm text-red-700 hover:bg-red-50 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Favorite Routes Section */}
              {activeSection === "favorite-routes" && (
                <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
                  <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        Favorite Routes
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Your saved routes
                      </p>
                    </div>
                    <button className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                      Add Route
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="space-y-4">
                      {favoriteRoutes.map((route) => (
                        <div
                          key={route.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                        >
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {route.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              From {route.from} to {route.to}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Frequency: {route.frequency}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">
                              Book Now
                            </button>
                            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                              Edit
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
                          Privacy Settings
                        </h3>
                        <div className="mt-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Location Sharing
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Share your location with drivers
                              </p>
                            </div>
                            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                              Enabled
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Data Collection
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Allow us to collect usage data to improve
                                service
                              </p>
                            </div>
                            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                              Enabled
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
                                Default Payment Method
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Credit Card ending in 4567
                              </p>
                            </div>
                            <button className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                              Change
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                Auto-Pay
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Automatically pay for rides
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
          userId={userId}
        />
      </div>
    </>
  );
}
