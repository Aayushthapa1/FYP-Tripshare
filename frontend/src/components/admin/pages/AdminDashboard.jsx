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
  const { users, loading: usersLoading } = useSelector((state) => state.user);
  // Add other selectors as needed for rides, payments, etc.


  // Debug data coming from Redux
  useEffect(() => {
    console.log("Users from Redux:", users);
  }, [users]);

  // Calculate user statistics based on your database schema
  const totalUsers = users?.length || 0;
  const driversCount =
    users?.filter((user) => user.role === "driver").length || 0;
  const ridersCount = users?.filter((user) => user.role === "user").length || 0;
  const adminCount = users?.filter((user) => user.role === "Admin").length || 0;

  // User growth calculation (example)
  const getUserGrowthPercentage = () => {
   
    return 0;
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
          statusColor: "bg-green-600",
        },
        {
          id: "default-2",
          user: "Jane Smith",
          action: "Started ride",
          time: "5 minutes ago",
          status: "In Progress",
          statusColor: "bg-blue-600",
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
          ? "bg-purple-600"
          : user.role === "Admin"
          ? "bg-pink-600"
          : "bg-blue-600",
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
    <div className="space-y-6">
      {/* Page Header with Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Dashboard Overview
            </h2>
            <p className="text-gray-500 mt-1">Welcome back, Admin</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="bg-gray-100 rounded-lg p-1 inline-flex">
              <button
                onClick={() => setTimeRange("week")}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  timeRange === "week"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange("month")}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  timeRange === "month"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeRange("year")}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${
                  timeRange === "year"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Year
              </button>
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 rounded-lg p-2 text-white">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 rounded-full px-2 py-0.5">
                ↑{getUserGrowthPercentage()}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Total Users
            </h3>
            <div className="text-2xl font-bold text-gray-800">
              {totalUsers.toLocaleString()}
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {ridersCount.toLocaleString()} riders ·{" "}
              {driversCount.toLocaleString()} drivers
              {adminCount > 0 ? ` · ${adminCount} admins` : ""}
            </div>
          </div>

          {/* Active Rides */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 rounded-lg p-2 text-white">
                <Car className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 rounded-full px-2 py-0.5">
                ↑8%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Active Rides
            </h3>
            <div className="text-2xl font-bold text-gray-800">
              {isLoading ? "..." : "1,247"}
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 rounded-lg p-2 text-white">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-100 rounded-full px-2 py-0.5">
                ↑15%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Revenue</h3>
            <div className="text-2xl font-bold text-gray-800">
              {isLoading ? "..." : "$85,245"}
            </div>
          </div>

          {/* Disputes */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-500 rounded-lg p-2 text-white">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-red-600 bg-red-100 rounded-full px-2 py-0.5">
                ↓5%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Disputes</h3>
            <div className="text-2xl font-bold text-gray-800">
              {isLoading ? "..." : "23"}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="font-semibold text-gray-800">Revenue Trends</h3>
            </div>
            <select className="text-sm border-gray-300 rounded-md">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={areaData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366F1"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#F59E0B"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* User Types Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <UserCheck className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="font-semibold text-gray-800">User Distribution</h3>
            </div>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
          ) : totalUsers > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
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
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Users"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center flex-col">
              <ShieldCheck className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-gray-500">No user data available</p>
            </div>
          )}

          <div className="flex justify-center mt-4 space-x-6">
            {userTypeData.map((entry, index) => (
              <div key={`legend-${index}`} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor:
                      USER_TYPE_COLORS[index % USER_TYPE_COLORS.length],
                  }}
                ></div>
                <span className="text-sm text-gray-600">
                  {entry.name}:{" "}
                  <span className="font-medium">{entry.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row: Recent Activity & Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="font-semibold text-gray-800">Recent Activity</h3>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              View All
            </button>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentActivities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            {activity.user.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {activity.user}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {activity.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${activity.statusColor}`}
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
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="font-semibold text-gray-800">
                Bookings & Payments
              </h3>
            </div>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="booking"
                    fill="#4F46E5"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                  <Bar
                    dataKey="payment"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
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
