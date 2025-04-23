"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDriverPayments } from "../../Slices/paymentSlice";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
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

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to prepare chart data
const preparePaymentChartData = (chartData = []) => {
  if (!chartData || chartData.length === 0) return null;

  // Sort data by date
  const sortedData = [...chartData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Format dates for display
  const labels = sortedData.map((item) => {
    const date = new Date(item.date);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  // Return chart data in the format expected by Chart.js
  return {
    labels,
    datasets: [
      {
        label: "Amount (Rs.)",
        data: sortedData.map((item) => item.amount),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.3,
      },
    ],
  };
};

const DriverPaymentsDashboard = ({ setActiveSection }) => {
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

  // Prepare chart data
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
    return `Rs. ${Number(amount).toLocaleString("en-IN")}`;
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

  return (
    <div className="space-y-6">
      {/* Back to Dashboard button */}
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => setActiveSection("dashboard")}
          className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </button>

        <button
          onClick={handleRefresh}
          className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full"
          disabled={loading}
        >
          <RefreshCw
            className={`mr-1.5 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh Data
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-gray-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
          Date Range
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={dateFilter.startDate}
              onChange={handleDateFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={dateFilter.endDate}
              onChange={handleDateFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Payment Dashboard
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
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
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700 bg-gradient-to-br from-green-50 to-white dark:from-green-900/30 dark:to-gray-800">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Earnings
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(driverPaymentStats?.totalEarnings || 0)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    From {driverPaymentStats?.totalPayments || 0} payments
                  </p>
                </div>

               

                {/* Completed Payments */}
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/30 dark:to-gray-800">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-purple-500 mr-2" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Completed
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {driverPaymentStats?.completedPayments || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {Math.round(
                      ((driverPaymentStats?.completedPayments || 0) /
                        (driverPaymentStats?.totalPayments || 1)) *
                        100
                    )}
                    % of total
                  </p>
                </div>

                {/* Average Per Trip */}
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/30 dark:to-gray-800">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-orange-500 mr-2" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Avg. Per Trip
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(
                      driverPaymentStats?.totalTrips > 0
                        ? Math.round(
                            driverPaymentStats?.totalEarnings /
                              driverPaymentStats?.totalTrips
                          )
                        : 0
                    )}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    per trip
                  </p>
                </div>
              </div>

              {/* Earnings Chart */}
              <div className="mb-6">
                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                  Earnings Over Time
                </h3>
                {paymentChartData ? (
                  <div className="h-80">
                    <Line
                      data={paymentChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                          title: {
                            display: true,
                            text: "Payment Amounts by Date",
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                return `Amount: ${formatCurrency(context.raw)}`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "Amount (Rs.)",
                            },
                          },
                          x: {
                            title: {
                              display: true,
                              text: "Date",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      No payment data available for the selected period
                    </p>
                  </div>
                )}
              </div>

              {/* Recent Payments */}
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                  Recent Payments
                </h3>
                {driverPayments && driverPayments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Booking
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Passenger
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Method
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {driverPayments.map((payment) => (
                          <tr
                            key={payment._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatDate(payment.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {payment.booking?._id?.substring(0, 8) || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {payment.booking?.user?.fullName ||
                                      payment.user?.fullName ||
                                      "Unknown"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${
                                  payment.status === "completed"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                    : payment.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                              >
                                {payment.status.charAt(0).toUpperCase() +
                                  payment.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">
                              {payment.paymentMethod}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
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

export default DriverPaymentsDashboard;
