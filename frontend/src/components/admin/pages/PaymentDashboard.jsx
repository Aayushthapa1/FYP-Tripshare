import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getAdminPaymentStats,
  getAllPayments,
  getUserPayments,
  getDriverPayments,
} from "../../Slices/paymentSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";
import {
  DollarSign,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  User,
  Users,
  Car,
  CreditCard,
  Wallet,
} from "lucide-react";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

const PaymentDashboard = ({ dashboardType = "admin" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get appropriate data from Redux store based on dashboard type
  const {
    adminStats,
    recentPayments,
    payments,
    userPayments,
    userPaymentStats,
    driverPayments,
    driverPaymentStats,
    loading,
    statsLoading,
  } = useSelector((state) => state.payment);

  const [dateRange, setDateRange] = useState({
    startDate: format(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  const [filters, setFilters] = useState({
    status: "",
    method: "",
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // Get the correct stats object based on dashboard type
  const stats =
    dashboardType === "admin"
      ? adminStats
      : dashboardType === "user"
      ? userPaymentStats
      : driverPaymentStats;

  // Get the correct payments list based on dashboard type
  const paymentsList =
    dashboardType === "admin"
      ? payments
      : dashboardType === "user"
      ? userPayments
      : driverPayments;

  // Fetch appropriate payment data on component mount
  useEffect(() => {
    if (dashboardType === "admin") {
      dispatch(getAdminPaymentStats(dateRange));
      dispatch(getAllPayments({ ...filters, sortField, sortDirection }));
    } else if (dashboardType === "user") {
      dispatch(getUserPayments({ ...filters }));
    } else if (dashboardType === "driver") {
      dispatch(getDriverPayments({ ...filters }));
    }
  }, [dispatch, dashboardType]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters based on dashboard type
  const applyFilters = () => {
    if (dashboardType === "admin") {
      dispatch(getAllPayments({ ...filters, sortField, sortDirection }));
    } else if (dashboardType === "user") {
      dispatch(getUserPayments(filters));
    } else if (dashboardType === "driver") {
      dispatch(getDriverPayments(filters));
    }
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update stats based on dashboard type
  const updateStats = () => {
    if (dashboardType === "admin") {
      dispatch(getAdminPaymentStats(dateRange));
    } else if (dashboardType === "user") {
      dispatch(getUserPayments({ ...filters, ...dateRange }));
    } else if (dashboardType === "driver") {
      dispatch(getDriverPayments({ ...filters, ...dateRange }));
    }
  };

  const sortData = (field) => {
    const newDirection =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);

    if (dashboardType === "admin") {
      dispatch(
        getAllPayments({
          ...filters,
          sortField: field,
          sortDirection: newDirection,
        })
      );
    }
  };

  // Get dashboard title based on type
  const getDashboardTitle = () => {
    switch (dashboardType) {
      case "user":
        return "My Payment History";
      case "driver":
        return "My Earnings";
      default:
        return "Payment Dashboard";
    }
  };

  // Get dashboard description based on type
  const getDashboardDescription = () => {
    switch (dashboardType) {
      case "user":
        return "Track your payment history and transactions";
      case "driver":
        return "Monitor your earnings and payment receipts";
      default:
        return "Manage and monitor all payment activities";
    }
  };

  // Prepare data for status pie chart
  const getStatusData = () => {
    if (!stats) return [];

    if (dashboardType === "admin" && stats.byStatus) {
      return Object.entries(stats.byStatus).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
    } else if (stats) {
      // For user and driver dashboards
      const statusCounts = {
        Completed: stats.completed || 0,
        Pending: stats.pending || 0,
        Failed: stats.failed || 0,
        Canceled: stats.canceled || 0,
      };

      return Object.entries(statusCounts)
        .map(([name, value]) => ({
          name,
          value,
        }))
        .filter((item) => item.value > 0);
    }

    return [];
  };

  // Prepare data for payment method pie chart
  const getMethodData = () => {
    if (!stats) return [];

    if (dashboardType === "admin" && stats.byMethod) {
      return Object.entries(stats.byMethod).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
    }

    return [];
  };

  // Get chart data from the appropriate stats object
  const getChartData = () => {
    if (!stats) return [];

    if (dashboardType === "admin") {
      return stats.chartData || [];
    } else if (dashboardType === "driver") {
      return stats.chartData || [];
    } else if (dashboardType === "user") {
      // If user stats has chartData format it properly
      return stats.chartData || [];
    }

    return [];
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {getDashboardTitle()}
            </h1>
            <p className="text-gray-500 mt-1">{getDashboardDescription()}</p>
          </div>
        </div>

        {/* Stats Cards - Adapts based on dashboard type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Payments / Transactions */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 rounded-lg p-2 text-white">
                {dashboardType === "user" ? (
                  <CreditCard className="w-6 h-6" />
                ) : dashboardType === "driver" ? (
                  <Car className="w-6 h-6" />
                ) : (
                  <Calendar className="w-6 h-6" />
                )}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {dashboardType === "user"
                ? "Total Transactions"
                : dashboardType === "driver"
                ? "Total Trips"
                : "Total Payments"}
            </h3>
            <div className="text-2xl font-bold text-gray-800">
              {statsLoading
                ? "..."
                : dashboardType === "admin"
                ? stats?.totalPayments || 0
                : dashboardType === "driver"
                ? stats?.totalTrips || 0
                : stats?.total || 0}
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 rounded-lg p-2 text-white">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {dashboardType === "driver" ? "Total Earnings" : "Total Amount"}
            </h3>
            <div className="text-2xl font-bold text-gray-800">
              {statsLoading
                ? "..."
                : `Rs. ${
                    dashboardType === "admin"
                      ? stats?.totalAmount?.toFixed(2) || "0.00"
                      : dashboardType === "driver"
                      ? stats?.totalEarnings?.toFixed(2) || "0.00"
                      : stats?.totalAmount?.toFixed(2) || "0.00"
                  }`}
            </div>
          </div>

          {/* Completed Payments */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 rounded-lg p-2 text-white">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              Completed
            </h3>
            <div className="text-2xl font-bold text-gray-800">
              {statsLoading
                ? "..."
                : dashboardType === "admin"
                ? stats?.byStatus?.completed || 0
                : dashboardType === "driver"
                ? stats?.completedPayments || 0
                : stats?.completed || 0}
            </div>
          </div>

          {/* Failed/Pending Payments */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-500 rounded-lg p-2 text-white">
                {dashboardType === "driver" ? (
                  <Wallet className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">
              {dashboardType === "driver" ? "Avg. Per Trip" : "Failed"}
            </h3>
            <div className="text-2xl font-bold text-gray-800">
              {statsLoading
                ? "..."
                : dashboardType === "driver"
                ? `Rs. ${
                    stats?.totalTrips > 0
                      ? Math.round(
                          stats?.totalEarnings / stats?.totalTrips
                        ).toFixed(2)
                      : "0.00"
                  }`
                : dashboardType === "admin"
                ? stats?.byStatus?.failed || 0
                : stats?.failed || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Selector for Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Payment Statistics
        </h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
              className="border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
              className="border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={updateStats}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Update Stats
            </button>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {dashboardType === "driver"
              ? "Earnings Over Time"
              : "Revenue Over Time"}
          </h2>
          {statsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : getChartData()?.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={getChartData()}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
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
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey={dashboardType === "driver" ? "date" : "date"}
                    tickLine={false}
                  />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value) => [
                      `Rs. ${value.toFixed(2)}`,
                      dashboardType === "driver" ? "Earnings" : "Amount",
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={dashboardType === "driver" ? "amount" : "amount"}
                    name={dashboardType === "driver" ? "Earnings" : "Revenue"}
                    stroke="#6366F1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                No data available for the selected period
              </p>
            </div>
          )}
        </div>

        {/* Payment Status Distribution - Only show for admin and user */}
        {(dashboardType === "admin" || dashboardType === "user") && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Status Distribution
            </h2>
            {statsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : getStatusData().length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getStatusData().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} payments`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        )}

        {/* Driver-specific chart - Trip count or bookings per day */}
        {dashboardType === "driver" && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Trip Completion Statistics
            </h2>
            {statsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : stats && stats.totalBookings ? (
              <div className="h-64 flex flex-col items-center justify-center">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {stats.totalBookings}
                  </div>
                  <p className="text-gray-600">Total Bookings</p>
                </div>

                <div className="w-full max-w-md bg-gray-200 rounded-full h-4 mt-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full"
                    style={{
                      width: `${
                        (stats.completedPayments / stats.totalBookings) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between w-full max-w-md mt-2">
                  <span className="text-gray-600 text-sm">
                    {stats.completedPayments} Completed
                  </span>
                  <span className="text-gray-600 text-sm">
                    {(
                      (stats.completedPayments / stats.totalBookings) *
                      100
                    ).toFixed(1)}
                    % Completion Rate
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No trip data available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Method Distribution - Admin only */}
      {dashboardType === "admin" && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Payment Method Distribution
          </h2>
          {statsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : getMethodData().length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getMethodData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getMethodData().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} payments`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No data available</p>
            </div>
          )}
        </div>
      )}

      {/* Recent/All Payments */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {dashboardType === "admin"
              ? "Recent Payments"
              : dashboardType === "driver"
              ? "Recent Earnings"
              : "Recent Transactions"}
          </h2>
          {dashboardType === "admin" && (
            <button
              onClick={() => dispatch(getAllPayments({}))}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          )}
        </div>

        {/* Payments Table Display */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : paymentsList && paymentsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  {dashboardType === "admin" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                  )}
                  {dashboardType === "driver" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Passenger
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paymentsList.map((payment) => (
                  <tr
                    key={payment._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment._id.substring(0, 8)}...
                    </td>
                    {(dashboardType === "admin" ||
                      dashboardType === "driver") && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                            {dashboardType === "admin"
                              ? (payment.user?.fullName || "?").charAt(0)
                              : (payment.booking?.user?.fullName || "?").charAt(
                                  0
                                )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {dashboardType === "admin"
                                ? payment.user?.fullName || "N/A"
                                : payment.booking?.user?.fullName || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      Rs. {payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          payment.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => {
                          const path =
                            dashboardType === "admin"
                              ? `/admin/payments/${payment._id}`
                              : dashboardType === "driver"
                              ? `/driver/payments/${payment._id}`
                              : `/payments/${payment._id}`;
                          navigate(path);
                        }}
                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {dashboardType === "admin"
                ? "No recent payments found"
                : dashboardType === "driver"
                ? "No earnings data found"
                : "No transaction history found"}
            </p>
          </div>
        )}
      </div>

      {/* Filters Section - Only for Admin */}
      {dashboardType === "admin" && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            All Payments
          </h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="pl-10 border border-gray-300 rounded-lg p-2 bg-white focus:ring-blue-500 focus:border-blue-500 w-full"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  name="method"
                  value={filters.method}
                  onChange={handleFilterChange}
                  className="pl-10 border border-gray-300 rounded-lg p-2 bg-white focus:ring-blue-500 focus:border-blue-500 w-full"
                >
                  <option value="">All Methods</option>
                  <option value="khalti">Khalti</option>
                  <option value="esewa">eSewa</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="pl-10 border border-gray-300 rounded-lg p-2 bg-white focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="pl-10 border border-gray-300 rounded-lg p-2 bg-white focus:ring-blue-500 focus:border-blue-500 w-full"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Search className="w-4 h-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>

          {/* Admin Payments Table - similar to recent payments but can be filtered and sorted */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : payments?.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => sortData("_id")}
                    >
                      <div className="flex items-center">
                        ID {renderSortIcon("_id")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => sortData("amount")}
                    >
                      <div className="flex items-center">
                        Amount {renderSortIcon("amount")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => sortData("status")}
                    >
                      <div className="flex items-center">
                        Status {renderSortIcon("status")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => sortData("createdAt")}
                    >
                      <div className="flex items-center">
                        Date {renderSortIcon("createdAt")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment._id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.user?.fullName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.booking
                          ? payment.booking._id.substring(0, 8) + "..."
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Rs. {payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {payment.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            payment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() =>
                            navigate(`/admin/payments/${payment._id}`)
                          }
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                No payments found matching your filters
              </p>
              <button
                onClick={() => {
                  setFilters({
                    status: "",
                    method: "",
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                  });
                  dispatch(getAllPayments({}));
                }}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentDashboard;
