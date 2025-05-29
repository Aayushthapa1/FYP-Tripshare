import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  fetchAdminTripAnalytics,
  cleanupExpiredTrips,
} from "../../Slices/tripSlice";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Car,
  Users,
  Banknote,
  Calendar,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Map,
  Route,
  UserCheck,
  UserPlus,
  Loader,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  Trash2,
  AlertCircle,
} from "lucide-react";

const AdminTripAnalytics = () => {
  const dispatch = useDispatch();
  const { adminAnalytics, adminAnalyticsLoading, error, cleanupStats } =
    useSelector((state) => state.trip);

  // Filter states
  const [period, setPeriod] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userType, setUserType] = useState("");
  const [groupBy, setGroupBy] = useState("userType");
  const [showDetails, setShowDetails] = useState({});
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);

  // Colors for charts
  const COLORS = [
    "#4f46e5",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
  ];

  // Load analytics on mount and when filters change
  const loadAnalytics = useCallback(() => {
    const params = { period };

    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }

    if (userType) {
      params.userType = userType;
    }

    if (groupBy) {
      params.groupBy = groupBy;
    }

    dispatch(fetchAdminTripAnalytics(params));
  }, [dispatch, period, startDate, endDate, userType, groupBy]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Handle cleanup expired trips
  const handleCleanupExpired = () => {
    dispatch(cleanupExpiredTrips())
      .unwrap()
      .then((result) => {
        toast.success(
          `Cleanup successful: ${result.removedCount} expired trips removed`
        );
        setShowCleanupConfirm(false);
        // Reload analytics after cleanup
        loadAnalytics();
      })
      .catch((err) => {
        toast.error(`Cleanup failed: ${err}`);
        setShowCleanupConfirm(false);
      });
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return new Intl.NumberFormat().format(num);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format percentage
  const formatPercent = (value) => {
    if (value === undefined || value === null) return "0%";
    return `${value.toFixed(1)}%`;
  };

  // Toggle section details
  const toggleDetails = (section) => {
    setShowDetails((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Render loading state
  if (adminAnalyticsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">
            Loading Analytics
          </h3>
          <p className="text-gray-500 mt-2">
            Please wait while we gather the data...
          </p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">
            Error Loading Analytics
          </h3>
          <p className="text-gray-600 mt-2 mb-4">{error}</p>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Trip Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Comprehensive insights and statistics for your platform's trips and
          bookings
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center mb-4 md:mb-0">
            <Filter className="h-5 w-5 mr-2 text-green-600" /> Analytics Filters
          </h2>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => loadAnalytics()}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  adminAnalyticsLoading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>

            <button
              onClick={() => setShowCleanupConfirm(true)}
              className="px-3 py-2 bg-amber-100 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-200 transition-colors flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cleanup Expired
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Time Period Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
              <option value="year">Last 365 Days</option>
            </select>
          </div>

          {/* Custom Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Group By Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group By
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="userType">User Type</option>
              <option value="status">Trip Status</option>
              <option value="route">Routes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      {adminAnalytics ? (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Trips */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Trips
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {formatNumber(adminAnalytics.summary?.totalTrips || 0)}
                  </h3>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Car className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600 font-medium">
                  {adminAnalytics.summary?.activeDrivers?.size || 0} Active
                  Drivers
                </span>
              </div>
            </div>

            {/* Total Bookings */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Bookings
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {formatNumber(adminAnalytics.summary?.totalBookings || 0)}
                  </h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpRight className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-blue-600 font-medium">
                  {adminAnalytics.summary?.activePassengers?.size || 0} Active
                  Passengers
                </span>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Revenue
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {formatCurrency(adminAnalytics.summary?.totalRevenue || 0)}
                  </h3>
                </div>
                <div className="bg-violet-100 p-3 rounded-lg">
                  <Banknote className="h-6 w-6 text-violet-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-600">
                  Average per trip:{" "}
                  {formatCurrency(
                    (adminAnalytics.summary?.totalRevenue || 0) /
                      (adminAnalytics.summary?.totalTrips || 1)
                  )}
                </span>
              </div>
            </div>

            {/* Occupancy Rate */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Avg. Occupancy Rate
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {formatPercent(
                      adminAnalytics.summary?.averageOccupancyRate || 0
                    )}
                  </h3>
                </div>
                <div className="bg-amber-100 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-600">
                  {adminAnalytics.userSegmentation?.newUsers || 0} new users,{" "}
                  {adminAnalytics.userSegmentation?.returningUsers || 0}{" "}
                  returning
                </span>
              </div>
            </div>
          </div>

          {/* Trip Status Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Trip Status Distribution
              </h2>
              <button
                onClick={() => toggleDetails("tripStatus")}
                className="text-gray-500 hover:text-gray-700"
              >
                {showDetails.tripStatus ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
            </div>

            {(showDetails.tripStatus || !showDetails.tripStatus) &&
              adminAnalytics.tripsByStatus && (
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    showDetails.tripStatus ? "max-h-[500px]" : "max-h-[300px]"
                  }`}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(adminAnalytics.tripsByStatus).map(
                          ([status, count], index) => ({
                            name:
                              status.charAt(0).toUpperCase() + status.slice(1),
                            value: count,
                          })
                        )}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {Object.entries(adminAnalytics.tripsByStatus).map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} trips`, "Count"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

            {showDetails.tripStatus &&
              adminAnalytics.detailedBreakdown &&
              groupBy === "status" && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h3 className="font-medium text-gray-700 mb-3">
                    Status Details
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Count
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            % of Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(adminAnalytics.tripsByStatus).map(
                          ([status, count], index) => (
                            <tr
                              key={status}
                              className={
                                index % 2 === 0 ? "bg-white" : "bg-gray-50"
                              }
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {count}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {(
                                  (count / adminAnalytics.summary.totalTrips) *
                                  100
                                ).toFixed(1)}
                                %
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>

          {/* Popular Routes */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Popular Routes
              </h2>
              <button
                onClick={() => toggleDetails("routes")}
                className="text-gray-500 hover:text-gray-700"
              >
                {showDetails.routes ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
            </div>

            {(showDetails.routes || !showDetails.routes) &&
              adminAnalytics.popularRoutes && (
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    showDetails.routes ? "max-h-[500px]" : "max-h-[300px]"
                  }`}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={adminAnalytics.popularRoutes.slice(0, 5)}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="route" />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke="#8884d8"
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#82ca9d"
                      />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="count"
                        fill="#8884d8"
                        name="Trip Count"
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="revenue"
                        fill="#82ca9d"
                        name="Revenue"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

            {showDetails.routes && adminAnalytics.popularRoutes && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-700 mb-3">
                  Route Details
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Route
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trip Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg Per Trip
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {adminAnalytics.popularRoutes.map((route, index) => (
                        <tr
                          key={route.route}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {route.route}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {route.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(route.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(route.revenue / route.count)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Booking Trends */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">
                Booking Trends
              </h2>
              <button
                onClick={() => toggleDetails("bookings")}
                className="text-gray-500 hover:text-gray-700"
              >
                {showDetails.bookings ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
            </div>

            {(showDetails.bookings || !showDetails.bookings) &&
              adminAnalytics.bookingTrends && (
                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    showDetails.bookings ? "max-h-[500px]" : "max-h-[300px]"
                  }`}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={adminAnalytics.bookingTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#8884d8"
                        name="Bookings"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Returning Users</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {adminAnalytics.userSegmentation?.returningUsers || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {adminAnalytics.userSegmentation?.returningUsers > 0 &&
                    adminAnalytics.summary?.activePassengers?.size > 0
                      ? (
                          (adminAnalytics.userSegmentation.returningUsers /
                            adminAnalytics.summary.activePassengers.size) *
                          100
                        ).toFixed(1)
                      : 0}
                    % of total users
                  </p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <UserPlus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">New Users</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {adminAnalytics.userSegmentation?.newUsers || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {adminAnalytics.userSegmentation?.newUsers > 0 &&
                    adminAnalytics.summary?.activePassengers?.size > 0
                      ? (
                          (adminAnalytics.userSegmentation.newUsers /
                            adminAnalytics.summary.activePassengers.size) *
                          100
                        ).toFixed(1)
                      : 0}
                    % of total users
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* User Type Breakdown */}
          {adminAnalytics.detailedBreakdown && groupBy === "userType" && (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  User Type Breakdown
                </h2>
                <button
                  onClick={() => toggleDetails("userType")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showDetails.userType ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="flex items-center text-gray-800 font-medium mb-3">
                    <Car className="h-5 w-5 mr-2 text-blue-600" /> Driver
                    Activity
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {adminAnalytics.detailedBreakdown.driver?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total trips created by drivers
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="flex items-center text-gray-800 font-medium mb-3">
                    <Users className="h-5 w-5 mr-2 text-green-600" /> Passenger
                    Activity
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {adminAnalytics.detailedBreakdown.passenger?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total bookings by passengers
                  </p>
                </div>
              </div>

              {showDetails.userType && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="flex space-x-2 mb-4">
                    <button
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        groupBy === "userType"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setGroupBy("userType")}
                    >
                      By User Type
                    </button>
                    <button
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        groupBy === "status"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setGroupBy("status")}
                    >
                      By Status
                    </button>
                    <button
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        groupBy === "route"
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                      onClick={() => setGroupBy("route")}
                    >
                      By Route
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Driver Details */}
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">
                        Top Drivers
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Driver
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trips
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Revenue
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {adminAnalytics.detailedBreakdown.driver &&
                              [
                                ...new Set(
                                  adminAnalytics.detailedBreakdown.driver.map(
                                    (trip) => trip.driverId
                                  )
                                ),
                              ]
                                .slice(0, 5)
                                .map((driverId) => {
                                  const driverTrips =
                                    adminAnalytics.detailedBreakdown.driver.filter(
                                      (trip) => trip.driverId === driverId
                                    );
                                  const revenue = driverTrips.reduce(
                                    (sum, trip) => sum + (trip.revenue || 0),
                                    0
                                  );
                                  return (
                                    <tr key={driverId}>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {driverTrips[0]?.driverName ||
                                          "Unknown Driver"}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {driverTrips.length}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatCurrency(revenue)}
                                      </td>
                                    </tr>
                                  );
                                })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Passenger Details */}
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">
                        Top Passengers
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Passenger
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bookings
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {adminAnalytics.detailedBreakdown.passenger &&
                              [
                                ...new Set(
                                  adminAnalytics.detailedBreakdown.passenger.map(
                                    (booking) => booking.passengerId
                                  )
                                ),
                              ]
                                .slice(0, 5)
                                .map((passengerId) => {
                                  const passengerBookings =
                                    adminAnalytics.detailedBreakdown.passenger.filter(
                                      (booking) =>
                                        booking.passengerId === passengerId
                                    );
                                  return (
                                    <tr key={passengerId}>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {passengerBookings[0]?.passengerName ||
                                          "Unknown Passenger"}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {passengerBookings.length}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs ${
                                            passengerBookings[0]?.status ===
                                            "completed"
                                              ? "bg-green-100 text-green-800"
                                              : passengerBookings[0]?.status ===
                                                "booked"
                                              ? "bg-blue-100 text-blue-800"
                                              : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {passengerBookings[0]?.status ||
                                            "Unknown"}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cleanup Stats */}
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Cleanup Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">
                  Last Cleanup
                </h3>
                <p className="text-lg font-semibold text-gray-800 mt-1">
                  {cleanupStats?.lastCleanup
                    ? new Date(cleanupStats.lastCleanup).toLocaleString()
                    : "Never run"}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">
                  Trips Removed
                </h3>
                <p className="text-lg font-semibold text-gray-800 mt-1">
                  {formatNumber(cleanupStats?.removedCount || 0)} trips
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <button
                  onClick={() => setShowCleanupConfirm(true)}
                  className="w-full py-2 bg-amber-100 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Run Cleanup Now
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Analytics Data Available
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            There doesn't seem to be any analytics data available for the
            selected filters.
          </p>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" /> Refresh Data
          </button>
        </div>
      )}

      {/* Cleanup Confirmation Modal */}
      {showCleanupConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">
              Clean Up Expired Trips
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              This action will permanently remove expired trips with no
              bookings. Are you sure you want to continue?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowCleanupConfirm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCleanupExpired}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Confirm Cleanup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTripAnalytics;
