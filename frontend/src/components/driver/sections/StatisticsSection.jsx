"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { Line, Bar } from "react-chartjs-2"
import {
  prepareTripsOverTimeChartData,
  tripsOverTimeOptions,
  preparePopularRoutesChartData,
} from "../utils/chartHelpers"

export default function StatisticsSection({
  setActiveSection,
  statsTimeframe,
  handleTimeframeChange,
  completedTrips,
  myTrips,
  stats,
}) {
  const [showAllTripsOverTime, setShowAllTripsOverTime] = useState(false)
  const [showAllPopularRoutes, setShowAllPopularRoutes] = useState(false)

  // Destructure trip statistics
  const {
    tripsOverTime = [],
    popularRoutes = [],
    completionRate = { total: 0, completed: 0, completionRate: 0 },
  } = stats || {}

  // Get chart data
  const tripsOverTimeChartData = prepareTripsOverTimeChartData(tripsOverTime)
  const popularRoutesChartData = preparePopularRoutesChartData(popularRoutes)

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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Driver Statistics</h2>
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
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Trips Over Time</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Trip count and revenue by date</p>
        </div>

        <div className="p-4">
          {tripsOverTimeChartData ? (
            <div className="h-80">
              <Line data={tripsOverTimeChartData} options={tripsOverTimeOptions} />
            </div>
          ) : (
            <p className="py-4 text-center text-gray-500 dark:text-gray-400">No trip data available</p>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">Detailed Trip Data</h3>
          {tripsOverTime && tripsOverTime.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">Date</th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">
                      Trip Count
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllTripsOverTime ? tripsOverTime : tripsOverTime.slice(0, 5)).map((day, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">{day._id}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">{day.count}</td>
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
                    onClick={() => setShowAllTripsOverTime(!showAllTripsOverTime)}
                    className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    {showAllTripsOverTime ? "Show Less" : "View All"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="py-4 text-center text-gray-500 dark:text-gray-400">No trip data available</p>
          )}
        </div>
      </div>

      {/* Popular Routes */}
      <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Popular Routes</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Most frequently driven routes</p>
        </div>

        <div className="p-4">
          {popularRoutesChartData ? (
            <div className="h-64">
              <Bar
                data={popularRoutesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: "Trip Count",
                      },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <p className="py-4 text-center text-gray-500 dark:text-gray-400">No route data available</p>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="mb-3 text-md font-medium text-gray-900 dark:text-white">Detailed Route Data</h3>
          {popularRoutes && popularRoutes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">From</th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">To</th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">Count</th>
                    <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900 dark:text-white">Avg Price</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllPopularRoutes ? popularRoutes : popularRoutes.slice(0, 5)).map((route, index) => (
                    <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">{route._id.from}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">{route._id.to}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">{route.count}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-gray-300">
                        Rs. {route.avgPrice}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {popularRoutes.length > 5 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowAllPopularRoutes(!showAllPopularRoutes)}
                    className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    {showAllPopularRoutes ? "Show Less" : "View All"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="py-4 text-center text-gray-500 dark:text-gray-400">No route data available</p>
          )}
        </div>
      </div>

      {/* Completion Rate */}
      <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Completion Rate</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Trip completion metrics</p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Trips</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completionRate.total || myTrips.length || 0}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed Trips</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completionRate.completed || completedTrips.length || 0}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completionRate.completionRate ||
                  (myTrips.length > 0 ? Math.round((completedTrips.length / myTrips.length) * 100) : 0)}
                %
              </p>
            </div>
          </div>

          {/* Progress bar for completion rate */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Completion Rate</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {completionRate.completionRate ||
                  (myTrips.length > 0 ? Math.round((completedTrips.length / myTrips.length) * 100) : 0)}
                %
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2.5 rounded-full bg-green-600"
                style={{
                  width: `${
                    completionRate.completionRate ||
                    (myTrips.length > 0 ? Math.round((completedTrips.length / myTrips.length) * 100) : 0)
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
