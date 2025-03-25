import axiosInstance from "../utils/axiosInstance";

// Utility functions for response handling
const handleResponse = (response) => {
  if (!response.data) {
    throw new Error("No data received from the server");
  }
  return response.data;
};

const handleError = (error) => {
  if (error.response) {
    // Try to extract error messages from the response
    const errors = error.response.data?.errors;
    const errMsg =
      (Array.isArray(errors) && errors.length > 0 && errors[0].message) ||
      error.response.data?.message ||
      "Unknown error";
    throw new Error(errMsg);
  } else if (error.request) {
    throw new Error("No response from server");
  } else {
    throw new Error(error.message);
  }
};

/**
 * Create a booking
 * POST /api/bookings
 * Body: { tripId, seats }
 */
export const createBooking = async ({ tripId, seats = 1, paymentMethod }) => {
  try {
    // Ensure seats is a number
    seats = Number(seats);
    if (isNaN(seats) || seats < 1) {
      throw new Error("Invalid seats value");
    }

    // Validate payment method
    if (!["COD", "online"].includes(paymentMethod)) {
      throw new Error("Invalid payment method");
    }

    // Make the API call to create the booking
    const response = await axiosInstance.post("/api/bookings", {
      tripId,
      seats,
      paymentMethod,
    });

    // Handle response from backend
    const data = handleResponse(response);
    if (!data.success) {
      throw new Error(data.message);
    }

    return data.booking; // Return the created booking object
  } catch (error) {
    throw handleError(error);
  }
};
/**
 * Get all bookings for the logged-in user
 * GET /api/bookings/my
 */
export const getMyBookings = async () => {
  try {
    const response = await axiosInstance.get("/api/bookings/my");
    const data = handleResponse(response);
    return data.Result?.bookings || [];
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Get details for a single booking
 * GET /api/bookings/:bookingId
 */
const fetchBookingDetails = async (bookingId) => {
  // Validate bookingId format before making the request
  if (!bookingId || typeof bookingId !== "string" || !bookingId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("Invalid booking ID format")
  }

  try {
    const response = await axiosInstance.get(`/api/bookings/${bookingId}`)
    return response.data
  } catch (error) {
    // Enhanced error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 404) {
        throw new Error("Booking not found")
      } else if (error.response.status === 400) {
        throw new Error("Invalid booking information")
      } else if (error.response.status === 401 || error.response.status === 403) {
        throw new Error("Not authorized to access this booking")
      }
    }
    // If it's a network error or something unexpected
    throw error
  }
}

/**
 * Cancel a booking
 * PATCH /api/bookings/:bookingId/cancel
 */
export const cancelBooking = async (bookingId) => {
  try {
    const response = await axiosInstance.patch(`/api/bookings/${bookingId}/cancel`);
    const data = handleResponse(response);
    return data.Result?.booking;
  } catch (error) {
    throw handleError(error);
  }
};

const bookingService = {
  createBooking,
  getMyBookings,
  fetchBookingDetails,
  cancelBooking,
};

export default bookingService;
