"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDriverPayments } from "../../Slices/paymentSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  ChevronLeft,
  DollarSign,
  Calendar,
  TrendingUp,
  CreditCard,
  CheckCircle,
  RefreshCw,
  User,
  Car,
} from "lucide-react";

// Helper function to prepare chart data for Recharts
const preparePaymentChartData = (chartData = []) => {
  if (!chartData || chartData.length === 0) return null;

  // Sort data by date
  const sortedData = [...chartData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Format dates and return data in the format expected by Recharts
  return sortedData.map((item) => {
    const date = new Date(item.date);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      amount: item.amount,
    };
  });
};

const EarningsSection = ({ setActiveSection }) => {
  const dispatch = useDispatch();
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // Last 30 days
    endDate: new Date().toISOString().split("T")[0],
  });
  const [refresh, setRefresh] = useState(false);

  // Get payment data from the Redux store
  const { driverPayments, driverPaymentStats, loading } = useSelector(
    (state) => state.payment
  );

  // Fetch payment data on component mount or filter change
  useEffect(() => {
    dispatch(getDriverPayments(dateFilter));
  }, [dispatch, dateFilter, refresh]);

  // Prepare chart data for Recharts
  const paymentChartData = preparePaymentChartData(
    driverPaymentStats?.chartData
  );

  // Handle date filter change
  const handleDateFilterChange = (e) => {
    setDateFilter({
      ...dateFilter,
      [e.target.name]: e.target.value,
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefresh((prev) => !prev);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md dark:bg-slate-800 dark:border-slate-700">
          <p className="font-medium text-slate-800 dark:text-white">{label}</p>
          <p className="text-green-600 dark:text-green-400">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-3">
          Date Range
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={dateFilter.startDate}
              onChange={handleDateFilterChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={dateFilter.endDate}
              onChange={handleDateFilterChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleRefresh}
            className="flex items-center text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw
              className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="rounded-lg bg-white shadow-sm dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
        <div className="border-b border-slate-200 p-4 dark:border-slate-700">
          <h2 className="text-lg font-medium text-slate-800 dark:text-white">
            Earnings Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track your earnings and payment history
          </p>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <>
              {/* Stats Summary */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                {/* Total Earnings */}
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700 bg-gradient-to-br from-green-50 to-white dark:from-green-900/30 dark:to-slate-800">
                  <div className="flex items-center">
                    <span className="text-green-500 font-semibold mr-2">
                      Rs.
                    </span>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Total Earnings
                    </p>
                  </div>

                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {formatCurrency(driverPaymentStats?.totalEarnings || 0)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    From {driverPaymentStats?.totalPayments || 0} payments
                  </p>
                </div>

                {/* This Month's Earnings */}
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/30 dark:to-slate-800">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      This Month
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {formatCurrency(driverPaymentStats?.monthlyEarnings || 0)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {driverPaymentStats?.monthlyPayments || 0} payments
                  </p>
                </div>

                {/* Completed Payments */}
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/30 dark:to-slate-800">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-purple-500 mr-2" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Completed
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {driverPaymentStats?.completedPayments || 0}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {Math.round(
                      ((driverPaymentStats?.completedPayments || 0) /
                        (driverPaymentStats?.totalPayments || 1)) *
                        100
                    )}
                    % of total
                  </p>
                </div>

                {/* Average Per Trip */}
                <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/30 dark:to-slate-800">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-orange-500 mr-2" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Avg. Per Trip
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {formatCurrency(
                      driverPaymentStats?.totalTrips > 0
                        ? Math.round(
                            driverPaymentStats?.totalEarnings /
                              driverPaymentStats?.totalTrips
                          )
                        : 0
                    )}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    per trip
                  </p>
                </div>
              </div>

              {/* Earnings Chart using Recharts */}
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-medium text-slate-800 dark:text-white">
                  Earnings Over Time
                </h3>
                {paymentChartData && paymentChartData.length > 0 ? (
                  <div className="h-80 border border-slate-200 rounded-lg p-4 dark:border-slate-700">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={paymentChartData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: "#6B7280" }}
                          axisLine={{ stroke: "#E5E7EB" }}
                        />
                        <YAxis
                          tick={{ fill: "#6B7280" }}
                          axisLine={{ stroke: "#E5E7EB" }}
                          tickFormatter={(value) => `₹${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          name="Amount (Rs.)"
                          stroke="#10B981"
                          fill="#10B981"
                          fillOpacity={0.3}
                          activeDot={{ r: 6 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-8 text-center border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">
                      No payment data available for the selected period
                    </p>
                  </div>
                )}
              </div>

              {/* Recent Payments */}
              <div>
                <h3 className="mb-4 text-lg font-medium text-slate-800 dark:text-white">
                  Recent Payments
                </h3>
                {driverPayments && driverPayments.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="min-w-full bg-white dark:bg-slate-800">
                      <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                            Booking
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                            Passenger
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                            Method
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {driverPayments.map((payment, index) => (
                          <tr
                            key={payment._id || index}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-white">
                              {formatDate(payment.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">
                              {payment.booking?._id?.substring(0, 8) || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-slate-100 dark:bg-slate-600 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-slate-800 dark:text-white">
                                    {payment.booking?.user?.fullName ||
                                      payment.user?.fullName ||
                                      "Unknown"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-white">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${
                                  payment.status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : payment.status === "pending"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                              >
                                {payment.status?.charAt(0).toUpperCase() +
                                  payment.status?.slice(1) || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300 capitalize">
                              {payment.paymentMethod || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-8 text-center border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400">
                      No payment records found for the selected period
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EarningsSection;
