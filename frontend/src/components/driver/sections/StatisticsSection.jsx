"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fetchDriverTripStats } from "../../Slices/tripSlice";
import { fetchDriverDashboardStats } from "../../Slices/driverDashboardSlice";

// Helper functions for chart data
const prepareTripsOverTimeChartData = (tripsOverTime) => {
  if (!tripsOverTime || tripsOverTime.length === 0) return null;

  return tripsOverTime.map((day) => ({
    date: day._id,
    count: day.count,
    revenue: day.revenue,
  }));
};

const preparePopularRoutesChartData = (popularRoutes) => {
  if (!popularRoutes || popularRoutes.length === 0) return null;

  return popularRoutes.map((route) => ({
    route: `${route._id.from} to ${route._id.to}`,
    count: route.count,
    avgPrice: route.avgPrice,
  }));
};

const prepareStatusDistributionData = (statusData) => {
  if (!statusData || statusData.length === 0) return null;

  return statusData.map((item) => ({
    name: item._id,
    value: item.count,
  }));
};

// Colors for pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function StatisticsSection({
  setActiveSection,
  statsTimeframe = "week",
  handleTimeframeChange,
  completedTrips = [],
  myTrips = [],
}) {
  const dispatch = useDispatch();

  // Access trip stats from Redux store
  const { tripStats, tripLoading, tripError } = useSelector((state) => ({
    tripStats: state.trip.stats,
    tripLoading: state.trip.loading,
    tripError: state.trip.error,
  }));

  // State for dashboard stats (legacy)
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  // Combined loading state
  const loading = tripLoading || dashboardLoading;

  const [showAllTripsOverTime, setShowAllTripsOverTime] = useState(false);
  const [showAllPopularRoutes, setShowAllPopularRoutes] = useState(false);

  // Fetch both dashboard stats sources when timeframe changes
  useEffect(() => {
    // Fetch new trip stats from Redux
    dispatch(fetchDriverTripStats({ period: statsTimeframe }));

    // Fetch legacy dashboard stats
    const getStats = async () => {
      setDashboardLoading(true);
      try {
        const response = await fetchDriverDashboardStats(statsTimeframe);
        setDashboardStats(response);
        setDashboardError(null);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        setDashboardError(error.message || "Failed to load dashboard stats");
      } finally {
        setDashboardLoading(false);
      }
    };

    getStats();
  }, [dispatch, statsTimeframe]);

  // Combine stats from both sources, preferring tripStats when available
  const combinedStats = {
    // From tripStats (new API)
    tripsOverTime: tripStats?.tripsOverTime || [],
    popularRoutes: tripStats?.popularRoutes || [],
    bookingStats: tripStats?.bookingStats || {
      totalTrips: 0,
      totalSeats: 0,
      totalBooked: 0,
      occupancyRate: 0,
    },
    completionRate: tripStats?.completionRate || {
      total: 0,
      completed: 0,
      completionRate: 0,
    },
    tripStatusDistribution: tripStats?.tripStatusDistribution || [],

    // Fallback to dashboard stats (legacy API)
    ...dashboardStats,
  };

  // Destructure combined stats
  const {
    tripsOverTime = [],
    popularRoutes = [],
    bookingStats = {
      totalTrips: 0,
      totalSeats: 0,
      totalBooked: 0,
      occupancyRate: 0,
    },
    completionRate = { total: 0, completed: 0, completionRate: 0 },
    tripStatusDistribution = [],
  } = combinedStats || {};

  // Calculate completion rate, using API first, then fallback to calculated
  const calculatedCompletionRate =
    completionRate.completionRate ||
    (myTrips.length > 0
      ? Math.round((completedTrips.length / myTrips.length) * 100)
      : 0);

  // Prepare data for charts
  const tripsOverTimeData = prepareTripsOverTimeChartData(tripsOverTime);
  const popularRoutesData = preparePopularRoutesChartData(popularRoutes);
  const statusDistributionData = prepareStatusDistributionData(
    tripStatusDistribution
  );

  return (
    <div className="space-y-6">
      {/* Back to Dashboard button */}
      <div className="mb-4">
        <button
          onClick={() => setActiveSection("dashboard")}
          className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Timeframe selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleTimeframeChange("week")}
            className={`rounded-lg px-3 py-1 text-sm ${
              statsTimeframe === "week"
                ? "bg-green-600 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => handleTimeframeChange("month")}
            className={`rounded-lg px-3 py-1 text-sm ${
              statsTimeframe === "month"
                ? "bg-green-600 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => handleTimeframeChange("year")}
            className={`rounded-lg px-3 py-1 text-sm ${
              statsTimeframe === "year"
                ? "bg-green-600 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Year
          </button>
        </div>
      </div>

    
    

      {/* Trips Over Time Chart */}
      <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Trips Over Time
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Trip count and revenue by date
          </p>
        </div>

        <div className="p-4">
          {loading ? (
            <p className="py-4 text-center text-gray-500 dark:text-gray-400">
              Loading trip data...
            </p>
          ) : tripsOverTimeData && tripsOverTimeData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={tripsOverTimeData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="count"
                    name="Trip Count"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (Rs.)"
                    stroke="#82ca9d"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-4 text-center text-gray-500 dark:text-gray-400">
              No trip data available
            </p>
          )}
        </div>

        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">
            Detailed Trip Data
          </h3>
          {tripsOverTime && tripsOverTime.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                      Date
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                      Trip Count
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllTripsOverTime
                    ? tripsOverTime
                    : tripsOverTime.slice(0, 5)
                  ).map((day, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                        {day._id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                        {day.count}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                        Rs. {day.revenue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tripsOverTime.length > 5 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() =>
                      setShowAllTripsOverTime(!showAllTripsOverTime)
                    }
                    className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    {showAllTripsOverTime ? "Show Less" : "View All"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="py-4 text-center text-gray-500 dark:text-gray-400">
              No trip data available
            </p>
          )}
        </div>
      </div>

      {/* Two-column layout for additional charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Popular Routes */}
        <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Popular Routes
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Most frequently driven routes
            </p>
          </div>

          <div className="p-4">
            {loading ? (
              <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                Loading route data...
              </p>
            ) : popularRoutesData && popularRoutesData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={popularRoutesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="route" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Trip Count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                No route data available
              </p>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">
              Detailed Route Data
            </h3>
            {popularRoutes && popularRoutes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                        From
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                        To
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                        Count
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                        Avg Price
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllPopularRoutes
                      ? popularRoutes
                      : popularRoutes.slice(0, 5)
                    ).map((route, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                          {route._id.from}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                          {route._id.to}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                          {route.count}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                          Rs. {route.avgPrice.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {popularRoutes.length > 5 && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() =>
                        setShowAllPopularRoutes(!showAllPopularRoutes)
                      }
                      className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    >
                      {showAllPopularRoutes ? "Show Less" : "View All"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                No route data available
              </p>
            )}
          </div>
        </div>

        {/* Trip Status Distribution */}
        <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Trip Status Distribution
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Distribution of trips by status
            </p>
          </div>

          <div className="p-4">
            {loading ? (
              <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                Loading status data...
              </p>
            ) : statusDistributionData && statusDistributionData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} trips`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                No status data available
              </p>
            )}
          </div>

          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">
              Status Breakdown
            </h3>
            {tripStatusDistribution && tripStatusDistribution.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                        Count
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tripStatusDistribution.map((status, index) => {
                      const totalTrips = tripStatusDistribution.reduce(
                        (sum, item) => sum + item.count,
                        0
                      );
                      const percentage =
                        totalTrips > 0
                          ? ((status.count / totalTrips) * 100).toFixed(1)
                          : 0;

                      return (
                        <tr
                          key={index}
                          className="border-b border-gray-200 dark:border-gray-700"
                        >
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                            {status._id}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                            {status.count}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                            {percentage}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                No status data available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
