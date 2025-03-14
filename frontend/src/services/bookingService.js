// src/services/bookingService.js

import axiosInstance from "../utils/axiosInstance"; 
import { io } from "socket.io-client";
// or your custom axios with interceptors

// Optionally, if you have a handleResponse/handleError utility:
const handleResponse = (response) => {
  if (!response.data) {
    throw new Error("No data received from the server");
  }
  return response.data; // e.g. { StatusCode, IsSuccess, ErrorMessage, Result: {...} }
};

const handleError = (error) => {
  if (error.response) {
    throw new Error(error.response.data?.ErrorMessage?.[0]?.message || error.response.data?.message || "Unknown error");
  } else if (error.request) {
    throw new Error("No response from server");
  } else {
    throw new Error(error.message);
  }
};

/**
 * Create a booking
 * POST /api/bookings
 * body: { tripId, seats }
 */
export const createBooking = async ({ tripId, seats = 1 }) => {
  try {
    const response = await axiosInstance.post("/api/bookings", { tripId, seats });
    const data = handleResponse(response);
    // data.Result.booking => the new booking doc
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
    // data.Result.bookings => array
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
    // data.Result.booking => the booking doc with trip & driver populated
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
    // data.Result.booking => the updated booking doc
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
