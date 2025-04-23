import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Car,
  DollarSign,
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
// Import other actions as needed for rides, payments, etc.

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
    error,
  } = useSelector((state) => state.user);
  // Add other selectors as needed for rides, payments, etc.

  // Debug data coming from Redux
  useEffect(() => {
    console.log("Users from Redux:", users);
    console.log("User Stats from Redux:", userStats);
    console.log("Pagination from Redux:", pagination);
    console.log("Error from Redux:", error);
  }, [users, userStats, pagination, error]);

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

  // User growth calculation (example)
  const getUserGrowthPercentage = () => {
    // Return placeholder value if no growth data is available
    return 12; // Placeholder value - replace with actual calculation when available
  };

  // Simulated data - replace with real data when available
  const areaData = [
    { name: "Mon", revenue: 4000, users: 2400, rides: 1800 },
    { name: "Tue", revenue: 3000, users: 1398, rides: 2000 },
    { name: "Wed", revenue: 2000, users: 9800, rides: 2200 },
  ];

  const barData = [
    { name: "Jan", booking: 4000, payment: 2400 },
    { name: "Feb", booking: 3000, payment: 1398 },
    { name: "Mar", booking: 2000, payment: 5800 },
  ];

  // User type distribution based on roles
  const userTypeData = [
    { name: "Riders", value: ridersCount },
    { name: "Drivers", value: driversCount },
    ...(adminCount > 0 ? [{ name: "Admins", value: adminCount }] : []),
  ];

  const COLORS = ["#4CAF50", "#FFC107", "#F44336"];
  const USER_TYPE_COLORS = ["#3B82F6", "#8B5CF6", "#EC4899"];

  // Get recent activities from users data
  const getRecentActivities = () => {
    if (!users || users.length === 0) {
      // Return default activities if no users
      return [
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
      ];
    }

    // Sort users by createdAt date (newest first)
    const sortedUsers = [...users]
      .sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      })
      .slice(0, 5);

    return sortedUsers.map((user, index) => ({
      id: user._id || index,
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
    }));
  };

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAllUsers());
    // Add other dispatch calls for rides, payments, etc.

    // Set loading state based on Redux loading state
    const timer = setTimeout(() => {
      if (!usersLoading) {
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  // Update loading state when Redux data changes
  useEffect(() => {
    if (!usersLoading && users) {
      setIsLoading(false);
    }
  }, [usersLoading, users]);

  const recentActivities = getRecentActivities();

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
              {isLoading ? "..." : "1,247"}
            </div>
            <div className="mt-3 text-xs text-slate-600 font-medium">
              {isLoading ? "" : "124 in progress · 45 scheduled"}
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-2xl shadow-md border border-violet-200 p-6 transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div className="bg-violet-500 rounded-xl p-3 text-white shadow-lg shadow-violet-200">
                <DollarSign className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-violet-600 bg-violet-100 rounded-full px-3 py-1 shadow-inner">
                ↑15%
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">Revenue</h3>
            <div className="text-3xl font-bold text-slate-800">
              {isLoading ? "..." : "$85,245"}
            </div>
            <div className="mt-3 text-xs text-slate-600 font-medium">
              {isLoading ? "" : "$12,234 this month"}
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
              {isLoading ? "..." : "23"}
            </div>
            <div className="mt-3 text-xs text-slate-600 font-medium">
              {isLoading ? "" : "8 pending · 15 resolved"}
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
            <select className="text-sm border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-violet-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
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
