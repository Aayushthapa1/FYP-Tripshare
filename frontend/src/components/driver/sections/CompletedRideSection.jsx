import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  User,
  Star,
  Clock,
  Download,
  Filter,
  Search,
  ArrowRight,
} from "lucide-react";
import useBookingActions from "../hooks/useBookingAction";

export default function CompletedRidesSection({
  setActiveSection,
  completedTrips,
  bookingsLoading,
}) {
  const { viewBookingDetails } = useBookingActions();
  const [filteredRides, setFilteredRides] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // "all", "thisWeek", "thisMonth", "lastMonth"
  const [sortOrder, setSortOrder] = useState("newest"); // "newest", "oldest", "highestRated"

  // Process and filter completed rides
  useEffect(() => {
    if (!completedTrips) return;

    let filtered = [...completedTrips].map((trip) => {
      const rideDate = new Date(
        trip.departureDate || trip.trip?.departureDate || trip.createdAt
      );

      return {
        id: trip._id,
        date: rideDate.toLocaleDateString(),
        time: rideDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        passenger:
          trip.passengerCount || trip.seatsBooked || trip.seats
            ? `${
                trip.passengerCount || trip.seatsBooked || trip.seats
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
          trip.fare ||
          trip.price ||
          trip.trip?.fare ||
          trip.trip?.price ||
          "N/A"
        }`,
        user: trip.user || { fullName: "Customer" },
        rawDate: rideDate,
      };
    });

    // Apply date filtering
    if (dateFilter !== "all") {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const startOfLastMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

      filtered = filtered.filter((ride) => {
        const rideDate = ride.rawDate;

        if (dateFilter === "thisWeek") {
          return rideDate >= startOfWeek;
        } else if (dateFilter === "thisMonth") {
          return rideDate >= startOfMonth;
        } else if (dateFilter === "lastMonth") {
          return rideDate >= startOfLastMonth && rideDate <= endOfLastMonth;
        }
        return true;
      });
    }

    // Apply search filtering
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (ride) =>
          ride.from.toLowerCase().includes(term) ||
          ride.to.toLowerCase().includes(term) ||
          ride.user.fullName.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    if (sortOrder === "newest") {
      filtered.sort((a, b) => b.rawDate - a.rawDate);
    } else if (sortOrder === "oldest") {
      filtered.sort((a, b) => a.rawDate - b.rawDate);
    } else if (sortOrder === "highestRated") {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredRides(filtered);
  }, [completedTrips, searchTerm, dateFilter, sortOrder]);

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
           
            <p className="text-lg text-slate-500 dark:text-slate-400">
              View your ride history and earnings
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
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

      {/* Filtering options */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Date:
            </span>
            <button
              onClick={() => setDateFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                dateFilter === "all"
                  ? "bg-green-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter("thisWeek")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                dateFilter === "thisWeek"
                  ? "bg-green-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateFilter("thisMonth")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                dateFilter === "thisMonth"
                  ? "bg-green-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateFilter("lastMonth")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                dateFilter === "lastMonth"
                  ? "bg-green-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              Last Month
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Sort:
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-700 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highestRated">Highest Rated</option>
            </select>
          </div>
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
              {filteredRides?.length || 0} Rides
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
              {filteredRides && filteredRides.length > 0 ? (
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
                          {ride.rating > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                              <Star className="mr-1 h-3 w-3" />
                              {ride.rating}/5
                            </span>
                          )}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            Completed
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
                            {ride.user.fullName}
                          </span>
                          <span>{ride.passenger}</span>
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
                    {searchTerm.trim() || dateFilter !== "all"
                      ? "No rides match your current filters. Try changing your search or filters."
                      : "When you complete rides, they will appear here with all the details and earnings."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Total earnings summary card */}
      {filteredRides && filteredRides.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
            Earnings Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-900/30">
              <p className="text-sm text-green-700 dark:text-green-400 mb-1">
                Total Earnings
              </p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-300">
                Rs. {calculateTotalEarnings(filteredRides)}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">
                Total Rides
              </p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                {filteredRides.length}
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-100 dark:border-amber-900/30">
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-1">
                Average Rating
              </p>
              <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">
                {calculateAverageRating(filteredRides)}/5
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to calculate total earnings
function calculateTotalEarnings(rides) {
  return rides
    .reduce((total, ride) => {
      const fareString = ride.fare.replace(/[^0-9.]/g, "");
      const fare = parseFloat(fareString) || 0;
      return total + fare;
    }, 0)
    .toLocaleString();
}

// Helper function to calculate average rating
function calculateAverageRating(rides) {
  const ridesWithRatings = rides.filter((ride) => ride.rating > 0);
  if (ridesWithRatings.length === 0) return "N/A";

  const totalRating = ridesWithRatings.reduce(
    (sum, ride) => sum + ride.rating,
    0
  );
  return (totalRating / ridesWithRatings.length).toFixed(1);
}
