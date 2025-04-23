import {
  ChevronLeft,
  Calendar,
  MapPin,
  User,
  Star,
  Clock,
  Download,
  Filter,
} from "lucide-react";
import useBookingActions from "../hooks/useBookingAction";

export default function CompletedRidesSection({
  setActiveSection,
  completedTrips,
  bookingsLoading,
}) {
  const { viewBookingDetails } = useBookingActions();

  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <button
            onClick={() => setActiveSection("dashboard")}
            className="mr-3 flex items-center justify-center rounded-full w-8 h-8 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Completed Rides
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View your ride history and earnings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </button>
          <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors">
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
              Ride History
            </h2>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              {completedTrips?.length || 0} Rides
            </span>
          </div>
        </div>

        <div className="p-5">
          {bookingsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400">
                Loading your ride history...
              </p>
            </div>
          ) : (
            <div>
              {completedTrips && completedTrips.length > 0 ? (
                <div className="space-y-4">
                  {completedTrips.map((trip) => {
                    const completedRide = {
                      id: trip._id,
                      date: new Date(
                        trip.departureDate ||
                          trip.trip?.departureDate ||
                          trip.createdAt
                      ).toLocaleDateString(),
                      time: new Date(
                        trip.departureDate ||
                          trip.trip?.departureDate ||
                          trip.createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      passenger:
                        trip.passengerCount || trip.seatsBooked || trip.seats
                          ? `${
                              trip.passengerCount ||
                              trip.seatsBooked ||
                              trip.seats
                            } passenger(s)`
                          : "No passenger info",
                      from:
                        trip.departureLocation ||
                        trip.trip?.departureLocation ||
                        trip.from ||
                        "Not specified",
                      to:
                        trip.destinationLocation ||
                        trip.trip?.destinationLocation ||
                        trip.to ||
                        "Not specified",
                      rating: trip.rating || 0,
                      fare: `Rs. ${
                        trip.fare || trip.price || trip.trip?.fare || "N/A"
                      }`,
                      user: trip.user || { fullName: "Customer" },
                    };

                    return (
                      <div
                        key={completedRide.id}
                        className="group flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-green-200 dark:hover:border-green-900/50 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                          <Calendar className="h-6 w-6" />
                        </div>

                        <div className="flex-grow">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                              <Clock className="mr-1 h-3 w-3" />
                              {completedRide.date} • {completedRide.time}
                            </span>
                            {completedRide.rating > 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                <Star className="mr-1 h-3 w-3" />
                                {completedRide.rating}/5
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-medium text-slate-800 dark:text-white mb-1">
                            <span className="inline-flex items-center">
                              <MapPin className="mr-1 h-4 w-4 text-green-500" />
                              {completedRide.from} to {completedRide.to}
                            </span>
                          </h3>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                            <span className="inline-flex items-center">
                              <User className="mr-1 h-4 w-4" />
                              {completedRide.user.fullName}
                            </span>
                            <span>{completedRide.passenger}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3 sm:mt-0">
                          <div className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-medium dark:bg-green-900/30 dark:text-green-400">
                            {completedRide.fare}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              viewBookingDetails(completedRide.id);
                            }}
                            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-green-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-green-400 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 dark:bg-slate-700">
                    <Calendar className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1">
                    No completed rides yet
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    When you complete rides, they will appear here with all the
                    details and earnings.
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
