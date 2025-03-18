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
export const createBooking = async ({ tripId, seats = 1 }) => {
  try {
    const response = await axiosInstance.post("/api/bookings", { tripId, seats });
    const data = handleResponse(response);
    return data.Result?.booking;
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
export const getBookingDetails = async (bookingId) => {
  try {
    const response = await axiosInstance.get(`/api/bookings/${bookingId}`);
    const data = handleResponse(response);
    return data.Result?.booking;
  } catch (error) {
    throw handleError(error);
  }
};

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
  getBookingDetails,
  cancelBooking,
};

export default bookingService;
