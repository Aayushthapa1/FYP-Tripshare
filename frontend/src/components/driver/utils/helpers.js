// Helper functions for status styling
export function getStatusColor(status) {
  const statusLower = (status || "").toLowerCase()
  switch (statusLower) {
    case "pending":
      return "bg-yellow-50 text-yellow-800 border-b border-yellow-100"
    case "booked":
    case "accepted":
      return "bg-green-50 text-green-800 border-b border-green-100"
    case "completed":
      return "bg-blue-50 text-blue-800 border-b border-blue-100"
    case "cancelled":
      return "bg-red-50 text-red-800 border-b border-red-100"
    default:
      return "bg-gray-50 text-gray-800 border-b border-gray-100"
  }
}

export function getStatusIcon(status, iconComponents) {
  const { Clock, Check, CheckCircle, X, AlertCircle } = iconComponents
  const statusLower = (status || "").toLowerCase()
  switch (statusLower) {
    case "pending":
      return Clock ? Clock({ size: 18, className: "text-yellow-600" }) : null
    case "booked":
    case "accepted":
      return Check ? Check({ size: 18, className: "text-green-600" }) : null
    case "completed":
      return CheckCircle ? CheckCircle({ size: 18, className: "text-blue-600" }) : null
    case "cancelled":
      return X ? X({ size: 18, className: "text-red-600" }) : null
    default:
      return AlertCircle ? AlertCircle({ size: 18, className: "text-gray-600" }) : null
  }
}

export function getPaymentStatusColor(status) {
  const statusLower = (status || "").toLowerCase()
  switch (statusLower) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "paid":
      return "bg-green-100 text-green-800"
    case "failed":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Format date to a readable format
export function formatDate(dateString) {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Format upcoming rides data
export function formatUpcomingRides(upcomingTrips, trips) {
  // First check if we have upcomingTrips from the driver bookings
  if (upcomingTrips && upcomingTrips.length > 0) {
    return upcomingTrips
      .map((trip) => ({
        id: trip._id,
        date: new Date(trip.departureDate || trip.trip?.departureDate || trip.createdAt).toLocaleDateString(),
        time: trip.departureTime || trip.trip?.departureTime || "Not specified",
        passenger:
          trip.passengerCount || trip.seatsBooked || trip.seats
            ? `${trip.passengerCount || trip.seatsBooked || trip.seats} passenger(s)`
            : "No passengers yet",
        from: trip.departureLocation || trip.trip?.departureLocation || trip.from || "Not specified",
        to: trip.destinationLocation || trip.trip?.destinationLocation || trip.to || "Not specified",
        status: trip.status || "Scheduled",
        fare: `Rs. ${trip.fare || trip.price || trip.trip?.fare || "N/A"}`,
        paymentStatus: trip.paymentStatus || "pending",
        user: trip.user || { fullName: "Customer" },
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  // Fall back to the trips data if upcomingTrips is empty
  if (!trips || !Array.isArray(trips)) return []

  return trips
    .filter((trip) => {
      // Filter for upcoming trips (those that haven't departed yet)
      const departureDate = new Date(trip.departureDate)
      return departureDate > new Date()
    })
    .map((trip) => ({
      id: trip._id,
      date: new Date(trip.departureDate).toLocaleDateString(),
      time: trip.departureTime || "Not specified",
      passenger: trip.passengerCount ? `${trip.passengerCount} passengers` : "No passengers yet",
      from: trip.departureLocation,
      to: trip.destinationLocation,
      status: trip.status || "Scheduled",
      fare: `Rs. ${trip.fare || "N/A"}`,
      paymentStatus: "pending",
      user: { fullName: "Customer" },
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}