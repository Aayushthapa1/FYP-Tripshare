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
  ExternalLink,
  Clock,
  Download,
} from "lucide-react";
import ProfileModal from "../../auth/ProfilePage";
import { getUserProfile } from "../../Slices/userSlice";
import { logoutUser } from "../../Slices/authSlice";
import { fetchMyBookings, getBookingDetails } from "../../Slices/bookingSlice";
import {
  getUserPayments,
  getPaymentDetails,
  // clearPaymentError,
} from "../../Slices/paymentSlice";
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
  const [currentPaymentId, setCurrentPaymentId] = useState(null);
  const [paymentDetailModalOpen, setPaymentDetailModalOpen] = useState(false);
  const [paymentFilters, setPaymentFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
  });

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
  console.log("the bookings are", myBookings);

  // Get payment data from Redux payment state
  const {
    userPayments = [],
    userPaymentStats = null,
    currentPayment = null,
    loading: paymentsLoading,
    error: paymentsError,
    pagination: paymentPagination = {
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      limit: 10,
    },
  } = useSelector((state) => state.payment);

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

  // Generate payment stats data based on payment history
  const generatePaymentStatsData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

    if (!userPayments || userPayments.length === 0) {
      return months.map((month) => ({ name: month, amount: 0 }));
    }

    // Create a base template with all months
    const template = months.map((month) => ({ name: month, amount: 0 }));

    // Sum payments per month
    userPayments.forEach((payment) => {
      if (payment.createdAt) {
        const date = new Date(payment.createdAt);
        const monthIndex = date.getMonth();
        if (monthIndex < 6 && payment.status === "completed") {
          // Only count completed payments from first 6 months
          template[monthIndex].amount += payment.amount || 0;
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

      // Fetch payment data for dashboard
      dispatch(getUserPayments());
    } else if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate("/login");
    }
  }, [dispatch, userId, isAuthenticated, navigate]);

  // Load payment data when user switches to payment section
  useEffect(() => {
    if (userId && activeSection === "payments") {
      dispatch(getUserPayments(paymentFilters));
    }
  }, [
    dispatch,
    userId,
    activeSection,
    paymentFilters.page,
    paymentFilters.limit,
  ]);

  // Handle payment errors
  useEffect(() => {
    if (paymentsError) {
      toast.error(`Payment error: ${paymentsError}`);
      dispatch(clearPaymentError());
    }
  }, [paymentsError, dispatch]);

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

  // Get payment details
  const viewPaymentDetails = (paymentId) => {
    setCurrentPaymentId(paymentId);
    dispatch(getPaymentDetails(paymentId))
      .then(() => {
        setPaymentDetailModalOpen(true);
      })
      .catch((error) => {
        toast.error("Failed to load payment details");
      });
  };

  // Handle payment filter changes
  const handlePaymentFilterChange = (e) => {
    const { name, value } = e.target;
    setPaymentFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply payment filters
  const applyPaymentFilters = (e) => {
    e.preventDefault();
    // Reset to page 1 when applying new filters
    dispatch(
      getUserPayments({
        ...paymentFilters,
        page: 1,
      })
    );
  };

  // Handle payment page change
  const handlePaymentPageChange = (newPage) => {
    if (newPage > 0 && newPage <= paymentPagination.totalPages) {
      setPaymentFilters((prev) => ({
        ...prev,
        page: newPage,
      }));
    }
  };

  // Format payment status
  const formatPaymentStatus = (status) => {
    if (!status) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "canceled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Get payment amount with formatting
  const getPaymentAmount = (payment) => {
    if (!payment || typeof payment.amount !== "number") return "N/A";
    return `Rs. ${payment.amount.toFixed()}`;
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

  // Use payment stats for total spent if available
  const totalSpent = userPaymentStats
    ? userPaymentStats.totalAmount
    : userPayments
    ? userPayments.reduce((total, payment) => {
        return payment.status === "completed"
          ? total + (payment.amount || 0)
          : total;
      }, 0)
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

                  {activeSection === "bookings" && "My Bookings"}

                  {activeSection === "payments" && "Payment History"}

                  {activeSection === "saved-locations" && "Saved Locations"}
                  {activeSection === "favorite-routes" && "Favorite Routes"}
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
                        Rs. {totalSpent.toFixed()}
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
                              formatter={(value) => [`Rs. ${value}`, "Amount"]}
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
                                  Rs. {booking.totalAmount || "N/A"}
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

                  {/* Payments Preview */}
                  <div className="rounded-2xl bg-white shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                          Recent Payments
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Your recent payment activity
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveSection("payments")}
                        className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      >
                        View All
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </button>
                    </div>

                    <div className="p-6">
                      {paymentsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-300 border-t-green-600"></div>
                        </div>
                      ) : !userPayments || userPayments.length === 0 ? (
                        <div className="py-8 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                            <CreditCard className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-lg">
                            No payment history found
                          </p>
                          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                            Your payment history will appear here
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {userPayments.slice(0, 3).map((payment) => (
                            <div
                              key={payment._id}
                              className="flex flex-col rounded-xl border border-slate-200 p-5 dark:border-slate-700 hover:shadow-md transition-shadow duration-300 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(
                                      payment.status
                                    )}`}
                                  >
                                    {formatPaymentStatus(payment.status)}
                                  </span>
                                  {payment.paymentMethod && (
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                                      {payment.paymentMethod}
                                    </span>
                                  )}
                                </div>
                                <h4 className="mt-2 font-medium text-slate-800 dark:text-white">
                                  {getPaymentAmount(payment)}
                                </h4>
                                {payment.createdAt && (
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    <Clock className="inline-block w-3.5 h-3.5 mr-1" />
                                    {new Date(
                                      payment.createdAt
                                    ).toLocaleString()}
                                  </p>
                                )}
                                {payment.booking && payment.booking.trip && (
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {payment.booking.trip.departureLocation} →{" "}
                                    {payment.booking.trip.destinationLocation}
                                  </p>
                                )}
                              </div>
                              <div className="mt-4 flex items-center gap-3 sm:mt-0">
                                <button
                                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                                  onClick={() =>
                                    viewPaymentDetails(payment._id)
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

                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                          <Ticket className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-full px-2.5 py-1">
                          All
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Total Bookings
                      </h4>
                      <p className="text-3xl font-bold text-slate-800 dark:text-white">
                        {myBookings ? myBookings.length : 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                          <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-full px-2.5 py-1">
                          Upcoming
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Upcoming Trips
                      </h4>
                      <p className="text-3xl font-bold text-slate-800 dark:text-white">
                        {myBookings
                          ? myBookings.filter(
                              (b) =>
                                b.status === "confirmed" ||
                                b.status === "scheduled" ||
                                b.status === "booked"
                            ).length
                          : 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-md dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                          <Car className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-full px-2.5 py-1">
                          Completed
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Completed Trips
                      </h4>
                      <p className="text-3xl font-bold text-slate-800 dark:text-white">
                        {myBookings
                          ? myBookings.filter((b) => b.status === "completed")
                              .length
                          : 0}
                      </p>
                    </div>
                  </div>

                  {/* Bookings List */}
                  <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                        My Bookings
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        All your trip bookings in one place
                      </p>
                    </div>

                    <div className="p-6">
                      {bookingsLoading ? (
                        <div className="flex justify-center items-center py-16">
                          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-green-600"></div>
                        </div>
                      ) : !myBookings || myBookings.length === 0 ? (
                        <div className="py-16 text-center">
                          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                            <Ticket className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                            No bookings found
                          </p>
                          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                            Your bookings will appear here once you book a trip
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {myBookings.map((booking) => (
                            <div
                              key={booking._id}
                              className="flex flex-col rounded-xl border border-slate-200 p-5 dark:border-slate-700 hover:shadow-md transition-shadow duration-300"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium 
                                    ${
                                      booking.status === "completed"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                        : booking.status === "booked" ||
                                          booking.status === "confirmed" ||
                                          booking.status === "scheduled"
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                        : booking.status === "cancelled" ||
                                          booking.status === "canceled"
                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    }`}
                                  >
                                    {booking.status
                                      ? booking.status.charAt(0).toUpperCase() +
                                        booking.status.slice(1)
                                      : "Pending"}
                                  </span>
                                  {booking.trip?.departureTime && (
                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {new Date(
                                        booking.trip.departureTime
                                      ).toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <span className="text-lg font-bold text-slate-800 dark:text-white">
                                    Rs.{" "}
                                    {booking.totalAmount
                                      ? booking.totalAmount.toFixed(2)
                                      : "N/A"}
                                  </span>
                                </div>
                              </div>

                              <div className="mb-4">
                                <div className="flex items-center text-slate-800 dark:text-white font-medium text-lg mb-2">
                                  <div className="flex items-center flex-wrap">
                                    <span className="truncate max-w-[180px] md:max-w-none">
                                      {booking.trip?.departureLocation || "N/A"}
                                    </span>
                                    <ChevronRight className="mx-1 h-4 w-4 text-slate-400" />
                                    <span className="truncate max-w-[180px] md:max-w-none">
                                      {booking.trip?.destinationLocation ||
                                        "N/A"}
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                    <User className="h-4 w-4 mr-2" />
                                    Passengers: {booking.seatsBooked || 1}
                                  </div>
                                  {booking.trip?.vehicleType && (
                                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                      <Car className="h-4 w-4 mr-2" />
                                      Vehicle: {booking.trip.vehicleType}
                                    </div>
                                  )}
                                  {booking.trip?.distance && (
                                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                      <MapPin className="h-4 w-4 mr-2" />
                                      Distance: {booking.trip.distance} km
                                    </div>
                                  )}
                                  {booking.createdAt && (
                                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      Booked on:{" "}
                                      {new Date(
                                        booking.createdAt
                                      ).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                  onClick={() =>
                                    navigate(`/bookings/${booking._id}`)
                                  }
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                >
                                  View Details
                                </button>

                                {(booking.status === "booked" ||
                                  booking.status === "confirmed" ||
                                  booking.status === "scheduled") && (
                                  <button
                                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                                    onClick={() =>
                                      toast.info(
                                        "Cancel booking functionality would be implemented here"
                                      )
                                    }
                                  >
                                    Cancel Booking
                                  </button>
                                )}

                                {booking.status === "completed" && (
                                  <button
                                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                                    onClick={() =>
                                      toast.info(
                                        "Rate trip functionality would be implemented here"
                                      )
                                    }
                                  >
                                    Rate Trip
                                  </button>
                                )}

                                {booking.trip?.tripType === "scheduled" && (
                                  <button
                                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium flex items-center"
                                    onClick={() =>
                                      toast.info(
                                        "Download ticket functionality would be implemented here"
                                      )
                                    }
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Ticket
                                  </button>
                                )}
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

                  {/* Payment Statistics Cards */}
                  {userPaymentStats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                      <div className="rounded-xl bg-white shadow-md p-5 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                          Total Payments
                        </p>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                          {userPaymentStats.total}
                        </h3>
                      </div>
                      <div className="rounded-xl bg-white shadow-md p-5 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <p className="text-green-600 dark:text-green-400 text-sm">
                          Completed
                        </p>
                        <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                          {userPaymentStats.completed}
                        </h3>
                      </div>
                      <div className="rounded-xl bg-white shadow-md p-5 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                          Pending
                        </p>
                        <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                          {userPaymentStats.pending}
                        </h3>
                      </div>
                      <div className="rounded-xl bg-white shadow-md p-5 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <p className="text-red-600 dark:text-red-400 text-sm">
                          Failed
                        </p>
                        <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                          {userPaymentStats.failed}
                        </h3>
                      </div>
                      <div className="rounded-xl bg-white shadow-md p-5 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <p className="text-blue-600 dark:text-blue-400 text-sm">
                          Total Amount
                        </p>
                        <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                          Rs.{" "}
                          {userPaymentStats.totalAmount?.toFixed() || "0.00"}
                        </h3>
                      </div>
                    </div>
                  )}

                  {/* Payment Filter Form */}
                  <div className="bg-white rounded-xl shadow-md p-6 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 mb-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                      Filter Payments
                    </h3>
                    <form
                      onSubmit={applyPaymentFilters}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          value={paymentFilters.status}
                          onChange={handlePaymentFilterChange}
                          className="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-200"
                        >
                          <option value="">All Statuses</option>
                          <option value="completed">Completed</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
                          <option value="canceled">Canceled</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={paymentFilters.startDate}
                          onChange={handlePaymentFilterChange}
                          className="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={paymentFilters.endDate}
                          onChange={handlePaymentFilterChange}
                          className="w-full p-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-slate-200"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
                          disabled={paymentsLoading}
                        >
                          {paymentsLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Filtering...
                            </>
                          ) : (
                            "Apply Filters"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Payment History Table */}
                  <div className="bg-white rounded-xl shadow-md overflow-hidden dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                        Payment History
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Your complete payment records
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      {paymentsLoading ? (
                        <div className="flex justify-center items-center py-16">
                          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-green-600"></div>
                        </div>
                      ) : !userPayments || userPayments.length === 0 ? (
                        <div className="py-16 text-center">
                          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                            <CreditCard className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                            No payment records found
                          </p>
                          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                            Once you make payments, they'll appear here
                          </p>
                        </div>
                      ) : (
                        <>
                          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                  Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                  Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                  Method
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                  Trip Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                              {userPayments.map((payment) => (
                                <tr
                                  key={payment._id}
                                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                    {formatDate(payment.createdAt)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-white">
                                    {getPaymentAmount(payment)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                        payment.status
                                      )}`}
                                    >
                                      {formatPaymentStatus(payment.status)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                    {payment.paymentMethod || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                    {payment.booking && payment.booking.trip ? (
                                      <span>
                                        {payment.booking.trip.departureLocation}{" "}
                                        →{" "}
                                        {
                                          payment.booking.trip
                                            .destinationLocation
                                        }
                                      </span>
                                    ) : payment.tripId ? (
                                      <span>
                                        {payment.tripId.departureLocation} →{" "}
                                        {payment.tripId.destinationLocation}
                                      </span>
                                    ) : (
                                      "N/A"
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                      onClick={() =>
                                        viewPaymentDetails(payment._id)
                                      }
                                      className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
                                    >
                                      View Details
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Pagination */}
                          {paymentPagination.totalPages > 1 && (
                            <div className="px-6 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                              <div className="flex-1 flex justify-between md:hidden">
                                <button
                                  onClick={() =>
                                    handlePaymentPageChange(
                                      paymentPagination.currentPage - 1
                                    )
                                  }
                                  disabled={paymentPagination.currentPage === 1}
                                  className={`relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md ${
                                    paymentPagination.currentPage === 1
                                      ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                                  }`}
                                >
                                  Previous
                                </button>
                                <button
                                  onClick={() =>
                                    handlePaymentPageChange(
                                      paymentPagination.currentPage + 1
                                    )
                                  }
                                  disabled={
                                    paymentPagination.currentPage ===
                                    paymentPagination.totalPages
                                  }
                                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md ${
                                    paymentPagination.currentPage ===
                                    paymentPagination.totalPages
                                      ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                                  }`}
                                >
                                  Next
                                </button>
                              </div>
                              <div className="hidden md:flex-1 md:flex md:items-center md:justify-between">
                                <div>
                                  <p className="text-sm text-slate-700 dark:text-slate-300">
                                    Showing{" "}
                                    <span className="font-medium">
                                      {(paymentPagination.currentPage - 1) *
                                        paymentPagination.limit +
                                        1}
                                    </span>{" "}
                                    to{" "}
                                    <span className="font-medium">
                                      {Math.min(
                                        paymentPagination.currentPage *
                                          paymentPagination.limit,
                                        paymentPagination.totalCount
                                      )}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium">
                                      {paymentPagination.totalCount}
                                    </span>{" "}
                                    results
                                  </p>
                                </div>
                                <div>
                                  <nav
                                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                    aria-label="Pagination"
                                  >
                                    <button
                                      onClick={() =>
                                        handlePaymentPageChange(
                                          paymentPagination.currentPage - 1
                                        )
                                      }
                                      disabled={
                                        paymentPagination.currentPage === 1
                                      }
                                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 dark:border-slate-600 text-sm font-medium ${
                                        paymentPagination.currentPage === 1
                                          ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                                      }`}
                                    >
                                      <span className="sr-only">Previous</span>
                                      <ChevronRight className="h-5 w-5 transform rotate-180" />
                                    </button>

                                    {/* Page numbers would go here */}
                                    <span className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200">
                                      {paymentPagination.currentPage} of{" "}
                                      {paymentPagination.totalPages}
                                    </span>

                                    <button
                                      onClick={() =>
                                        handlePaymentPageChange(
                                          paymentPagination.currentPage + 1
                                        )
                                      }
                                      disabled={
                                        paymentPagination.currentPage ===
                                        paymentPagination.totalPages
                                      }
                                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 dark:border-slate-600 text-sm font-medium ${
                                        paymentPagination.currentPage ===
                                        paymentPagination.totalPages
                                          ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                                      }`}
                                    >
                                      <span className="sr-only">Next</span>
                                      <ChevronRight className="h-5 w-5" />
                                    </button>
                                  </nav>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Other sections (upcoming, past-rides, notifications, settings) remain the same */}
              {/* For brevity, I'm not including them here, but they should stay as they were */}
            </main>
          </div>
        </div>

        {/* Profile Modal - Using the imported ProfileModal component */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userId={userId}
        />

        {/* Payment Details Modal */}
        {paymentDetailModalOpen && currentPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden animate-fade-in-up border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">
                  Payment Details
                </h3>
                <button
                  onClick={() => setPaymentDetailModalOpen(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <div className="mb-8 text-center">
                  <div
                    className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-3 ${
                      currentPayment.status === "completed"
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : currentPayment.status === "pending"
                        ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    <CreditCard className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
                    {getPaymentAmount(currentPayment)}
                  </h3>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      currentPayment.status
                    )}`}
                  >
                    {formatPaymentStatus(currentPayment.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Payment ID
                      </h4>
                      <p className="text-slate-800 dark:text-white font-medium mt-1">
                        {currentPayment._id}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Payment Method
                      </h4>
                      <p className="text-slate-800 dark:text-white font-medium mt-1">
                        {currentPayment.paymentMethod || "Online Payment"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Transaction ID
                      </h4>
                      <p className="text-slate-800 dark:text-white font-medium mt-1">
                        {currentPayment.transactionId || "N/A"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Date & Time
                      </h4>
                      <p className="text-slate-800 dark:text-white font-medium mt-1">
                        {currentPayment.createdAt
                          ? new Date(currentPayment.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {currentPayment.booking && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          Booking Reference
                        </h4>
                        <p className="text-slate-800 dark:text-white font-medium mt-1">
                          {currentPayment.booking._id || "N/A"}
                        </p>
                      </div>
                    )}

                    {currentPayment.booking && currentPayment.booking.trip && (
                      <>
                        <div>
                          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Trip Route
                          </h4>
                          <p className="text-slate-800 dark:text-white font-medium mt-1">
                            {currentPayment.booking.trip.departureLocation} →{" "}
                            {currentPayment.booking.trip.destinationLocation}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Departure Date
                          </h4>
                          <p className="text-slate-800 dark:text-white font-medium mt-1">
                            {currentPayment.booking.trip.departureDate
                              ? new Date(
                                  currentPayment.booking.trip.departureDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </>
                    )}

                    {currentPayment.seats && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          Seats Booked
                        </h4>
                        <p className="text-slate-800 dark:text-white font-medium mt-1">
                          {currentPayment.seats}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Possible actions based on payment status */}
                <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6 flex flex-wrap justify-end gap-4">
                  {currentPayment.status === "pending" && (
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      onClick={() => {
                        // This would trigger a payment completion flow
                        toast.info(
                          "Payment completion functionality would be implemented here"
                        );
                      }}
                    >
                      Complete Payment
                    </button>
                  )}

                  {currentPayment.status === "completed" && (
                    <button
                      className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center"
                      onClick={() => {
                        // This would trigger receipt download
                        toast.info(
                          "Receipt download functionality would be implemented here"
                        );
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </button>
                  )}

                  <button
                    className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => setPaymentDetailModalOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
