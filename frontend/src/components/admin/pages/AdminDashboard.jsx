import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Car,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Map,
  MessageSquare,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchAllUsers } from "../../Slices/userSlice";
import { fetchAdminTripAnalytics } from "../../Slices/tripSlice";
import { getAdminPaymentStats, getAllPayments } from "../../Slices/paymentSlice";

function AdminDashboard() {
  const dispatch = useDispatch();
  const [timeRange, setTimeRange] = useState("week");
  const [isLoading, setIsLoading] = useState(true);

  // Get data from Redux store
  const {
    users,
    userStats,
    pagination,
    loading: usersLoading,
    error: userError,
  } = useSelector((state) => state.user);
  console.log("Users from Redux:ok", users, userStats, pagination, usersLoading, userError);
  
  const {
    adminAnalytics,
    adminAnalyticsLoading,
    error: tripError,
  } = useSelector((state) => state.trip);
  console.log("Trip Analytics from Redux:ok", adminAnalytics, adminAnalyticsLoading, tripError);
  
  const {
    payments,
    adminPaymentStats,
    loading: paymentsLoading,
    error: paymentError,
  } = useSelector((state) => state.payment || {});
  console.log("Payments from Redux:ok", payments, adminPaymentStats, paymentsLoading, paymentError);

  // Debug data coming from Redux
  useEffect(() => {
    console.log("Users from Redux:", users);
    console.log("User Stats from Redux:", userStats);
    console.log("Trip Analytics from Redux:", adminAnalytics);
    console.log("Payment Stats from Redux:", adminPaymentStats);
    console.log("Error from Redux:", userError || tripError || paymentError);
  }, [users, userStats, adminAnalytics, adminPaymentStats, userError, tripError, paymentError]);

  // Calculate user statistics based on your database schema
  const totalUsers = userStats?.totalUsers || users?.length || 0;
  const driversCount =
    userStats?.driverCount ||
    users?.filter((user) => user.role === "driver").length ||
    0;
  const ridersCount =
    userStats?.userCount ||
    users?.filter((user) => user.role === "user").length ||
    0;
  const adminCount =
    userStats?.adminCount ||
    users?.filter((user) => user.role === "Admin").length ||
    0;

  // User growth calculation
  const getUserGrowthPercentage = () => {
    // Return real growth from userStats if available
    return userStats?.growthPercentage || 12; // Fallback value
  };

  // Trip statistics with fallbacks
  const getActiveTripsCount = () => {
    if (!adminAnalytics || !adminAnalytics.summary) return 1247; // Fallback value
    return adminAnalytics.summary.totalBookings || 1247;
  };

  const getInProgressTrips = () => {
    if (!adminAnalytics || !adminAnalytics.tripsByStatus) return 124; // Fallback value
    return adminAnalytics.tripsByStatus['in-progress'] || 124;
  };

  const getScheduledTrips = () => {
    if (!adminAnalytics || !adminAnalytics.tripsByStatus) return 45; // Fallback value
    return adminAnalytics.tripsByStatus.scheduled || 45;
  };

  // Revenue statistics with fallbacks
  const getTotalRevenue = () => {
    if (!adminAnalytics && !adminPaymentStats) return 8520; // Fallback value
    const analyticsRevenue = adminAnalytics?.summary?.totalRevenue;
    const paymentStatsRevenue = adminPaymentStats?.totalRevenue;
    return paymentStatsRevenue || analyticsRevenue || 8520;
  };

  const getCurrentPeriodRevenue = () => {
    if (!adminPaymentStats) return 12234; // Fallback value
    return adminPaymentStats.currentPeriodRevenue || 12234;
  };

  // Dispute statistics with fallbacks
  const getDisputesCount = () => {
    if (!adminPaymentStats) return 23; // Fallback value
    return adminPaymentStats.totalDisputes || 23;
  };

  const getPendingDisputes = () => {
    if (!adminPaymentStats) return 8; // Fallback value
    return adminPaymentStats.pendingDisputes || 8;
  };

  const getResolvedDisputes = () => {
    if (!adminPaymentStats) return 15; // Fallback value
    return adminPaymentStats.resolvedDisputes || 15;
  };

  // Generate trend data for charts
  const generateRevenueChartData = () => {
    // Default fallback data
    const defaultData = [
      { name: "Mon", revenue: 4000, users: 2400, rides: 1800 },
      { name: "Tue", revenue: 3000, users: 1398, rides: 2000 },
      { name: "Wed", revenue: 2000, users: 9800, rides: 2200 },
      { name: "Thu", revenue: 2780, users: 3908, rides: 2000 },
      { name: "Fri", revenue: 1890, users: 4800, rides: 2181 },
      { name: "Sat", revenue: 2390, users: 3800, rides: 2500 },
      { name: "Sun", revenue: 3490, users: 4300, rides: 2100 },
    ];

    if (!adminAnalytics || !adminAnalytics.bookingTrends) {
      return defaultData;
    }

    try {
      // Use adminPaymentStats.revenueTrends if available, otherwise generate from bookingTrends
      if (adminPaymentStats && adminPaymentStats.revenueTrends && adminPaymentStats.revenueTrends.length > 0) {
        return adminPaymentStats.revenueTrends.map((item) => ({
          name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: item.revenue || 0,
          users: item.userCount || 0,
          rides: item.rideCount || 0
        }));
      } else if (adminAnalytics.bookingTrends && adminAnalytics.bookingTrends.length > 0) {
        return adminAnalytics.bookingTrends.map((item) => ({
          name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: Math.round((adminAnalytics.summary?.totalRevenue || 85245) / adminAnalytics.bookingTrends.length),
          users: 0,
          rides: item.count || 0
        }));
      }

      return defaultData;
    } catch (error) {
      console.error("Error generating revenue chart data:", error);
      return defaultData;
    }
  };

  const generateBookingPaymentChartData = () => {
    // Default fallback data
    const defaultData = [
      { name: "Jan", booking: 4000, payment: 2400 },
      { name: "Feb", booking: 3000, payment: 1398 },
      { name: "Mar", booking: 2000, payment: 5800 },
      { name: "Apr", booking: 2780, payment: 3908 },
      { name: "May", booking: 1890, payment: 4800 },
      { name: "Jun", booking: 2390, payment: 3800 },
    ];

    if (!adminAnalytics && !adminPaymentStats) {
      return defaultData;
    }

    try {
      // Generate from adminAnalytics and adminPaymentStats
      const bookingData = adminAnalytics?.bookingTrends || [];
      const paymentData = adminPaymentStats?.paymentTrends || [];
      
      if (bookingData.length === 0 && paymentData.length === 0) {
        return defaultData;
      }
      
      // Group by month
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const result = months.map(month => ({ name: month, booking: 0, payment: 0 }));
      
      // Populate booking data
      bookingData.forEach(item => {
        try {
          const date = new Date(item.date);
          if (!isNaN(date.getTime())) {
            const month = date.getMonth();
            result[month].booking += item.count || 0;
          }
        } catch (err) {
          console.error("Error processing booking data:", err);
        }
      });
      
      // Populate payment data
      paymentData.forEach(item => {
        try {
          const date = new Date(item.date);
          if (!isNaN(date.getTime())) {
            const month = date.getMonth();
            result[month].payment += item.count || item.amount || 0;
          }
        } catch (err) {
          console.error("Error processing payment data:", err);
        }
      });
      
      // Return only months with data or default if none
      const filteredResult = result.filter(item => item.booking > 0 || item.payment > 0);
      return filteredResult.length > 0 ? filteredResult : defaultData.slice(0, 6);
    } catch (error) {
      console.error("Error generating booking/payment chart data:", error);
      return defaultData;
    }
  };

  // User type distribution based on roles
  const userTypeData = [
    { name: "Riders", value: ridersCount },
    { name: "Drivers", value: driversCount },
    ...(adminCount > 0 ? [{ name: "Admins", value: adminCount }] : []),
  ];

  const COLORS = ["#4CAF50", "#FFC107", "#F44336"];
  const USER_TYPE_COLORS = ["#3B82F6", "#8B5CF6", "#EC4899"];

  // Get recent activities from users data and trips/bookings
  const getRecentActivities = () => {
    // Default fallback activities
    const defaultActivities = [
      {
        id: "default-1",
        user: "John Doe",
        action: "Completed ride",
        time: "2 minutes ago",
        status: "Completed",
        statusColor: "bg-emerald-600",
      },
      {
        id: "default-2",
        user: "Jane Smith",
        action: "Started ride",
        time: "5 minutes ago",
        status: "In Progress",
        statusColor: "bg-violet-600",
      },
      {
        id: "default-3",
        user: "Alex Johnson",
        action: "Registered as driver",
        time: "Yesterday",
        status: "Driver",
        statusColor: "bg-amber-500",
      },
      {
        id: "default-4",
        user: "Sarah Williams",
        action: "Booked trip",
        time: "Yesterday",
        status: "Booked",
        statusColor: "bg-sky-500",
      },
      {
        id: "default-5",
        user: "Michael Brown",
        action: "Cancelled trip",
        time: "2 days ago",
        status: "Cancelled",
        statusColor: "bg-red-500",
      },
    ];

    if ((!users || users.length === 0) && 
        (!adminAnalytics || !adminAnalytics.tripsByUserType || !adminAnalytics.tripsByUserType.passenger)) {
      return defaultActivities;
    }

    try {
      const activities = [];
      
      // Add recent users
      if (users && users.length > 0) {
        // Sort users by createdAt date (newest first)
        const sortedUsers = [...users]
          .filter(user => user.createdAt) // Ensure createdAt exists
          .sort((a, b) => {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          })
          .slice(0, 3);

        sortedUsers.forEach((user, index) => {
          activities.push({
            id: user._id || `user-${index}`,
            user: user.fullName || user.email || "User",
            action:
              user.role === "driver"
                ? "Registered as driver"
                : user.role === "Admin"
                ? "Added as admin"
                : "Registered as rider",
            time: user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "Recently",
            status:
              user.role === "driver"
                ? "Driver"
                : user.role === "Admin"
                ? "Admin"
                : "Rider",
            statusColor:
              user.role === "driver"
                ? "bg-amber-500"
                : user.role === "Admin"
                ? "bg-fuchsia-600"
                : "bg-sky-500",
          });
        });
      }
      
      // Add recent trips/bookings
      if (adminAnalytics && 
          adminAnalytics.tripsByUserType && 
          adminAnalytics.tripsByUserType.passenger && 
          adminAnalytics.tripsByUserType.passenger.length > 0) {
        // Sort by most recent 
        const recentBookings = [...adminAnalytics.tripsByUserType.passenger]
          .filter(booking => booking.bookedAt) // Ensure bookedAt exists
          .sort((a, b) => new Date(b.bookedAt || 0) - new Date(a.bookedAt || 0))
          .slice(0, 2);
          
        recentBookings.forEach((booking, index) => {
          activities.push({
            id: booking.bookingId || `booking-${index}`,
            user: booking.passengerName || "Passenger",
            action: `Booked trip from ${booking.departureLocation || 'location'} to ${booking.destinationLocation || 'destination'}`,
            time: booking.bookedAt 
              ? new Date(booking.bookedAt).toLocaleDateString()
              : "Recently",
            status: booking.status || "Booked",
            statusColor: 
              booking.status === "completed" 
                ? "bg-emerald-600" 
                : booking.status === "cancelled"
                ? "bg-red-500"
                : "bg-violet-600",
          });
        });
      }
      
      // Sort all activities by time (most recent first) and take top 5
      return activities.length > 0 
        ? activities
            .sort((a, b) => {
              // This is a simplified sort - could enhance with proper date parsing
              return b.time > a.time ? 1 : -1;
            })
            .slice(0, 5)
        : defaultActivities;
    } catch (error) {
      console.error("Error generating recent activities:", error);
      return defaultActivities;
    }
  };

  // Fetch data on mount and when timeRange changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Dispatch all data fetching actions
        await Promise.all([
          dispatch(fetchAllUsers()),
          dispatch(fetchAdminTripAnalytics({ period: timeRange })),
          dispatch(getAdminPaymentStats({ period: timeRange })).catch(err => {
            console.log("Payment stats fetch error (non-critical):", err);
            return null;
          }),
          dispatch(getAllPayments()).catch(err => {
            console.log("Payments fetch error (non-critical):", err);
            return null;
          })
        ]);
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch, timeRange]);

  // Prepare data for charts
  const recentActivities = getRecentActivities();
  const areaData = generateRevenueChartData();
  const barData = generateBookingPaymentChartData();

  return (
    <div className="space-y-8 bg-slate-50 p-6 min-h-screen">
      {/* Page Header with Stats */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
              Dashboard Overview
            </h2>
            <p className="text-slate-500 mt-2 text-lg">Welcome back, Admin</p>
          </div>
          <div className="mt-6 sm:mt-0">
            <div className="bg-slate-100 rounded-xl p-1.5 inline-flex shadow-sm">
              <button
                onClick={() => setTimeRange("week")}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  timeRange === "week"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange("month")}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  timeRange === "month"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeRange("year")}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  timeRange === "year"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                Year
              </button>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-2xl shadow-md border border-sky-200 p-6 transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div className="bg-sky-500 rounded-xl p-3 text-white shadow-lg shadow-sky-200">
                <Users className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-sky-600 bg-sky-100 rounded-full px-3 py-1 shadow-inner">
                ↑{getUserGrowthPercentage()}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">
              Total Users
            </h3>
            <div className="text-3xl font-bold text-slate-800">
              {totalUsers.toLocaleString()}
            </div>
            <div className="mt-3 text-xs text-slate-600 font-medium">
              {ridersCount.toLocaleString()} riders ·{" "}
              {driversCount.toLocaleString()} drivers
              {adminCount > 0 ? ` · ${adminCount} admins` : ""}
            </div>
          </div>

          {/* Active Rides */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-md border border-emerald-200 p-6 transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div className="bg-emerald-500 rounded-xl p-3 text-white shadow-lg shadow-emerald-200">
                <Car className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 rounded-full px-3 py-1 shadow-inner">
                ↑8%
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">
              Active Rides
            </h3>
            <div className="text-3xl font-bold text-slate-800">
              {isLoading ? "..." : getActiveTripsCount().toLocaleString()}
            </div>
            <div className="mt-3 text-xs text-slate-600 font-medium">
              {isLoading ? "" : `${getInProgressTrips()} in progress · ${getScheduledTrips()} scheduled`}
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl shadow-md border border-violet-200 p-6 transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div className="bg-violet-500 rounded-xl p-3 text-white shadow-lg shadow-violet-200">
                {/* <DollarSign className="w-7 h-7" /> */}
              </div>
              <span className="text-xs font-semibold text-violet-600 bg-violet-100 rounded-full px-3 py-1 shadow-inner">
                ↑15%
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">Revenue</h3>
            <div className="text-3xl font-bold text-slate-800">
              {isLoading ? "..." : `$${getTotalRevenue().toLocaleString()}`}
            </div>
            <div className="mt-3 text-xs text-slate-600 font-medium">
              {isLoading ? "" : `$${getCurrentPeriodRevenue().toLocaleString()} this ${timeRange}`}
            </div>
          </div>

          {/* Disputes */}
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl shadow-md border border-rose-200 p-6 transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div className="bg-rose-500 rounded-xl p-3 text-white shadow-lg shadow-rose-200">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-rose-600 bg-rose-100 rounded-full px-3 py-1 shadow-inner">
                ↓5%
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">
              Disputes
            </h3>
            <div className="text-3xl font-bold text-slate-800">
              {isLoading ? "..." : getDisputesCount()}
            </div>
            <div className="mt-3 text-xs text-slate-600 font-medium">
              {isLoading ? "" : `${getPendingDisputes()} pending · ${getResolvedDisputes()} resolved`}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <TrendingUp className="w-6 h-6 text-slate-500 mr-3" />
              <h3 className="font-semibold text-slate-800 text-lg">
                Revenue Trends
              </h3>
            </div>
            <select 
              className="text-sm border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
              <option value="year">Last 365 days</option>
            </select>
          </div>

          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={areaData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow:
                        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rides"
                    stroke="#10B981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRides)"
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* User Types Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <UserCheck className="w-6 h-6 text-slate-500 mr-3" />
              <h3 className="font-semibold text-slate-800 text-lg">
                User Distribution
              </h3>
            </div>
          </div>

          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
            </div>
          ) : totalUsers > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={5}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {userTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={USER_TYPE_COLORS[index % USER_TYPE_COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, "Users"]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow:
                        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center flex-col">
              <ShieldCheck className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No user data available</p>
            </div>
          )}

          <div className="flex justify-center mt-6 space-x-8">
            {userTypeData.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{
                    backgroundColor:
                      USER_TYPE_COLORS[index % USER_TYPE_COLORS.length],
                  }}
                ></div>
                <span className="text-sm text-slate-600">
                  {entry.name}:{" "}
                  <span className="font-semibold">{entry.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row: Recent Activity & Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <MessageSquare className="w-6 h-6 text-slate-500 mr-3" />
              <h3 className="font-semibold text-slate-800 text-lg">
                Recent Activity
              </h3>
            </div>
            <button className="text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-violet-50">
              View All
            </button>
          </div>

          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {recentActivities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="hover:bg-slate-50 transition duration-150"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-medium shadow-md">
                            {activity.user.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-800">
                              {activity.user}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-700">
                        {activity.action}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500">
                        {activity.time}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span
                          className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${activity.statusColor} shadow-sm`}
                        >
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Booking vs Payment Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Calendar className="w-6 h-6 text-slate-500 mr-3" />
              <h3 className="font-semibold text-slate-800 text-lg">
                Bookings & Payments
              </h3>
            </div>
          </div>

          {isLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
            </div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "12px",
                      border: "none",
                      boxShadow:
                        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: "20px",
                    }}
                  />
                  <Bar
                    dataKey="booking"
                    fill="#8B5CF6"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="payment"
                    fill="#10B981"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;