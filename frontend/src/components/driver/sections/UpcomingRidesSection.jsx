"use client"

import { ChevronLeft } from "lucide-react"
import { formatUpcomingRides } from "../utils/helpers.js"
import useBookingActions from "../hooks/useBookingAction.js"

export default function UpcomingRidesSection({ setActiveSection, upcomingTrips, bookingsLoading }) {
  const { viewBookingDetails, handleAcceptBooking, handleCompleteBooking, handleRejectBooking } = useBookingActions()

  // Get upcoming rides from trips data
  const upcomingRides = formatUpcomingRides(upcomingTrips)

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
      <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Rides</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">All your scheduled pickups</p>
        </div>

        <div className="p-4">
          {bookingsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : upcomingRides.length > 0 ? (
            <div className="space-y-4">
              {upcomingRides.map((ride) => (
                <div
                  key={ride.id}
                  className="flex flex-col rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {ride.date} • {ride.time}
                      </span>
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {ride.status}
                      </span>
                    </div>
                    <h4 className="mt-2 font-medium text-gray-900 dark:text-white">
                      {ride.from} to {ride.to}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{ride.passenger}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 sm:mt-0">
                    <p className="font-medium text-gray-900 dark:text-white">{ride.fare}</p>
                    <div className="flex gap-2">
                      {ride.status.toLowerCase() === "pending" && (
                        <>
                          <button
                            onClick={(e) => handleAcceptBooking(ride.id, e)}
                            className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={(e) => handleRejectBooking(ride.id, e)}
                            className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {(ride.status.toLowerCase() === "booked" || ride.status.toLowerCase() === "accepted") && (
                        <button
                          onClick={(e) => handleCompleteBooking(ride.id, e)}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          viewBookingDetails(ride.id)
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">No upcoming rides scheduled</p>
          )}
        </div>
      </div>
    </div>
  )
}
