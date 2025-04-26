"use client";

import { useState, useEffect, useMemo } from "react"; // Added useMemo import
import {
  ChevronLeft,
  MapPin,
  Calendar,
  User,
  Clock,
  Search,
  Filter,
  ArrowRight,
} from "lucide-react";
import { formatUpcomingRides } from "../utils/helpers.js";
import useBookingActions from "../hooks/useBookingAction.js";

export default function UpcomingRidesSection({
  setActiveSection,
  upcomingTrips,
  bookingsLoading,
}) {
  const {
    viewBookingDetails,
    handleAcceptBooking,
    handleCompleteBooking,
    handleRejectBooking,
    handleCancelBooking,
  } = useBookingActions();
  const [filteredRides, setFilteredRides] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Memoize upcoming rides to prevent infinite re-renders
  const upcomingRides = useMemo(
    () => formatUpcomingRides(upcomingTrips),
    [upcomingTrips]
  );

  // Filter rides based on search term and status
  useEffect(() => {
    let filtered = [...upcomingRides];

    // Filter by status if not "all"
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (ride) => ride.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ride) =>
          ride.from.toLowerCase().includes(term) ||
          ride.to.toLowerCase().includes(term) ||
          (ride.passengerName &&
            ride.passengerName.toLowerCase().includes(term))
      );
    }

    setFilteredRides(filtered);
  }, [upcomingRides, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header with back button and search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => setActiveSection("dashboard")}
            className="mr-3 flex items-center justify-center rounded-full w-8 h-8 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              Manage your scheduled pickups and requests
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search rides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
          />
        </div>
      </div>

      {/* Status filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-green-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === "pending"
                ? "bg-amber-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("booked")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === "booked"
                ? "bg-green-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            Booked
          </button>
          <button
            onClick={() => setStatusFilter("accepted")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === "accepted"
                ? "bg-blue-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            Accepted
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
              Upcoming Rides
            </h2>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              {filteredRides.length} Ride{filteredRides.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="p-5">
          {bookingsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400">
                Loading your upcoming rides...
              </p>
            </div>
          ) : (
            <div>
              {filteredRides.length > 0 ? (
                <div className="space-y-4">
                  {filteredRides.map((ride) => (
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
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
                              ride.status
                            )}`}
                          >
                            {ride.status}
                          </span>
                        </div>

                        <h3 className="text-base font-medium text-slate-800 dark:text-white mb-1">
                          <span className="inline-flex items-center">
                            <MapPin className="mr-1 h-4 w-4 text-green-500" />
                            {ride.from}
                            <ArrowRight className="mx-1 h-3 w-3 text-slate-400" />
                            {ride.to}
                          </span>
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center">
                            <User className="mr-1 h-4 w-4" />
                            {ride.passengerName || "Passenger"}
                          </span>
                          <span>{ride.passenger}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3 sm:mt-0">
                        <div className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-400">
                          {ride.fare}
                        </div>
                        <div className="flex gap-2">
                          {ride.status.toLowerCase() === "pending" && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcceptBooking(ride.id);
                                }}
                                className="px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors flex items-center dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                              >
                                Accept
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectBooking(ride.id);
                                }}
                                className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors flex items-center dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {(ride.status.toLowerCase() === "booked" ||
                            ride.status.toLowerCase() === "accepted") && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCompleteBooking(ride.id);
                                }}
                                className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors flex items-center dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                              >
                                Complete
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelBooking(ride.id);
                                }}
                                className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors flex items-center dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              viewBookingDetails(ride.id);
                            }}
                            className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition-colors flex items-center dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 dark:bg-slate-700">
                    <Calendar className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">
                    No upcoming rides found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    {statusFilter !== "all"
                      ? `No ${statusFilter} rides found. Try changing your filter.`
                      : "You don't have any upcoming rides scheduled at the moment."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to get status-specific styling
function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case "booked":
    case "accepted":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "completed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
  }
}
