"use client";

import {
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Car,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  Banknote,
} from "lucide-react";
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
import { formatUpcomingRides } from "../utils/helpers.js";
import useBookingActions from "../hooks/useBookingAction.js";

export default function DashboardOverview({
  setActiveSection,
  upcomingTrips,
  completedTrips,
  myTrips,
  bookingsLoading,
  stats,
}) {
  const { viewBookingDetails } = useBookingActions();

  // Get upcoming rides from trips data
  const upcomingRides = formatUpcomingRides(upcomingTrips);

  // Destructure stats
  const {
    bookingStats = {
      totalTrips: 0,
      totalSeats: 0,
      totalBooked: 0,
    },
    completionRate = { total: 0, completed: 0, completionRate: 0 },
    earnings = { total: 0, thisMonth: 0, lastMonth: 0 },
  } = stats || {};

  // Prepare data for Recharts
  const tripsOverTimeData =
    stats?.tripsOverTime?.map((item) => ({
      name: item.period || item.date || "",
      trips: item.count || 0,
      revenue: item.revenue || 0,
    })) || generateDummyTimeData();

  // Prepare trip status data for pie chart
  const tripStatusData =
    stats?.tripStatusDistribution?.map((item) => ({
      name: item.status || "",
      value: item.count || 0,
    })) || generateDummyStatusData();

  // Format the completion rate to ensure it doesn't overflow
  const formatCompletionRate = (rate) => {
    // Ensure we're working with a number and round to 1 decimal place
    const numericRate = Number(rate);
    if (isNaN(numericRate)) return "0";

    return Math.round(numericRate);
  };

  // Calculate the completion rate
  const calculatedCompletionRate =
    completionRate.completionRate ||
    (myTrips.length > 0
      ? Math.round((completedTrips.length / myTrips.length) * 100)
      : 0);

  // Format it to prevent overflow
  const displayCompletionRate = formatCompletionRate(calculatedCompletionRate);

  // Colors for pie chart
  const COLORS = ["#4CAF50", "#2196F3", "#FFC107", "#FF5722", "#9C27B0"];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 shadow-md text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome to your Driver Dashboard
            </h1>
            <p className="text-green-50">
              Track your rides, manage bookings, and monitor your earnings all
              in one place.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setActiveSection("upcoming")}
              className="px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors shadow-sm flex items-center"
            >
              View Upcoming Rides
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview - Using actual data from stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="rounded-xl bg-green-50 p-3 dark:bg-green-900/30">
              <Car className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Trips
              </p>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                {bookingStats.totalTrips || 0}
              </h4>
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="bg-green-500 h-full rounded-full"
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-900/30">
              <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Completed Trips
              </p>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                {completionRate.completed || completedTrips.length || 0}
              </h4>
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{
                width: `${displayCompletionRate}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="rounded-xl bg-purple-50 p-3 dark:bg-purple-900/30">
              <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Completion Rate
              </p>
              <h4
                className="text-2xl font-bold text-slate-800 dark:text-white truncate"
                title={`${calculatedCompletionRate}%`}
              >
                {displayCompletionRate}%
              </h4>
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full"
              style={{
                width: `${displayCompletionRate}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-900/30">
              <Banknote className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Earnings
              </p>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-white">
                Rs.{" "}
                {earnings?.total ||
                  (completedTrips.length * 500).toLocaleString()}
              </h4>
            </div>
          </div>
          <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: "75%" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Upcoming Rides */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
              Upcoming Rides
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your scheduled pickups
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

        <div className="p-6">
          {bookingsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : upcomingRides.length > 0 ? (
            <div className="space-y-4">
              {upcomingRides.slice(0, 3).map((ride) => (
                <div
                  key={ride.id}
                  className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-green-200 dark:hover:border-green-900/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <Calendar className="h-6 w-6" />
                  </div>

                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                        <Clock className="mr-1 h-3 w-3" />
                        {ride.date} • {ride.time}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {ride.status}
                      </span>
                    </div>

                    <h3 className="text-base font-medium text-slate-800 dark:text-white mb-1">
                      <span className="inline-flex items-center">
                        <MapPin className="mr-1 h-4 w-4 text-green-500" />
                        {ride.from} to {ride.to}
                      </span>
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center">
                        <Users className="mr-1 h-4 w-4" />
                        {ride.passenger}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3 sm:mt-0">
                    <div className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-400">
                      {ride.fare}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        viewBookingDetails(ride.id);
                      }}
                      className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-green-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-green-400 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}

              {upcomingRides.length > 3 && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => setActiveSection("upcoming")}
                    className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    View {upcomingRides.length - 3} more upcoming rides
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 dark:bg-slate-700">
                <Calendar className="h-8 w-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">
                No upcoming rides
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                You don't have any upcoming rides scheduled. Check back later or
                view your booking history.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Trips Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/30">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Trips Over Time
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Trip count and revenue trends
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSection("statistics")}
              className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              View Stats
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>

          <div className="p-6 h-72">
            {tripsOverTimeData && tripsOverTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={tripsOverTimeData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: "#E5E7EB" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "0.5rem",
                      border: "1px solid #E5E7EB",
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      padding: "0.75rem",
                    }}
                    labelStyle={{ fontWeight: "bold", marginBottom: "0.5rem" }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingTop: "0.5rem" }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="trips"
                    name="Trips"
                    stroke="#4CAF50"
                    strokeWidth={2}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    dot={{ r: 4, strokeWidth: 0, fill: "#4CAF50" }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#2196F3"
                    strokeWidth={2}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    dot={{ r: 4, strokeWidth: 0, fill: "#2196F3" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 dark:bg-slate-700">
                  <TrendingUp className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">
                  No trip data yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                  Complete more trips to see your performance trends over time.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Trip Status Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-50 p-2 dark:bg-purple-900/30">
                <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Trip Status Distribution
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Breakdown by status
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 h-72">
            {tripStatusData && tripStatusData.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tripStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={50}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {tripStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} trips`, name]}
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "0.5rem",
                      border: "1px solid #E5E7EB",
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      padding: "0.75rem",
                    }}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingLeft: "2rem" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 dark:bg-slate-700">
                  <DollarSign className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">
                  No status data yet
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                  Complete more trips to see your trip status distribution.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate dummy time data if no real data is available
function generateDummyTimeData() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month) => ({
    name: month,
    trips: Math.floor(Math.random() * 50) + 10,
    revenue: Math.floor(Math.random() * 5000) + 1000,
  }));
}

// Helper function to generate dummy status data if no real data is available
function generateDummyStatusData() {
  return [
    { name: "Completed", value: 0 },
    { name: "In Progress", value: 0 },
    { name: "Cancelled", value: 0 },
    { name: "Scheduled", value: 0 },
  ];
}
