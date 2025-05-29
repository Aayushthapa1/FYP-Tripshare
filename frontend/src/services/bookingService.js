// bookingService.js

import axios from "axios";
import { Base_Backend_Url } from "../../constant";
import formatError from "../utils/errorUtils";
import axiosInstance from "../utils/axiosInstance";

/**
 * CREATE a booking
 * POST /api/bookings/create
 */
const createBooking = async ({ tripId, seats, paymentMethod }) => {
  try {
    console.log("Creating booking with data:", { tripId, seats, paymentMethod });

    // If your backend requires auth headers/cookies, use axiosInstance
    const response = await axiosInstance.post(
      `${Base_Backend_Url}/api/bookings/create`,
      { tripId, seats, paymentMethod },
      {
        withCredentials: true, // If cookies/sessions are needed
      }
    );

    // Return the entire server response or shape it as you prefer
    return response.data;
  } catch (error) {
    console.error("createBooking error:", error);
    // For all other errors, use your standard error formatter
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * GET all bookings for the logged-in user
 * GET /api/bookings/my
 */
const getMyBookings = async () => {
  try {
    console.log("Fetching my bookings...");

    const response = await axiosInstance.get(
      `${Base_Backend_Url}/api/bookings/mybookings`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("getMyBookings error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * GET details for a single booking
 * GET /api/bookings/:bookingId
 */
const fetchBookingDetails = async (bookingId) => {
  try {
    console.log("Fetching booking details for ID:", bookingId);

    const response = await axiosInstance.get(
      `${Base_Backend_Url}/api/bookings/${bookingId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("fetchBookingDetails error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * CANCEL a booking
 * PUT /api/bookings/cancel/:bookingId
 */
const cancelBooking = async (bookingId) => {
  try {
    console.log("Cancelling booking for ID:", bookingId);

    const response = await axiosInstance.put(
      `${Base_Backend_Url}/api/bookings/cancel/${bookingId}`,
      {},
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("cancelBooking error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

// === DRIVER ROUTES (updated to match your exact routes) ===

/**
 * GET pending bookings for a driver
 * GET /api/bookings/pending
 */
const getDriverPendingBookings = async () => {
  try {
    console.log("Fetching driver's pending bookings...");

    const response = await axiosInstance.get(
      `${Base_Backend_Url}/api/bookings/pending`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("getDriverPendingBookings error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * GET all bookings for a driver's trips
 * GET /api/bookings/all
 */
const getDriverBookings = async () => {
  try {
    console.log("Fetching all driver's bookings...");

    const response = await axiosInstance.get(
      `${Base_Backend_Url}/api/bookings/all`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("getDriverBookings error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * ACCEPT a booking (driver only)
 * PUT /api/bookings/accept/:bookingId
 */
const acceptBooking = async (bookingId) => {
  try {
    console.log("Accepting booking ID:", bookingId);

    const response = await axiosInstance.put(
      `${Base_Backend_Url}/api/bookings/accept/${bookingId}`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("acceptBooking error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * REJECT a booking (driver only)
 * PUT /api/bookings/reject/:bookingId
 */
const rejectBooking = async (bookingId, reason) => {
  try {
    console.log("Rejecting booking ID:", bookingId, "Reason:", reason);

    const response = await axiosInstance.put(
      `${Base_Backend_Url}/api/bookings/reject/${bookingId}`,
      { reason },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("rejectBooking error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * COMPLETE a booking (driver only)
 * PUT /api/bookings/complete/:bookingId
 */
const completeBooking = async (bookingId) => {
  try {
    console.log("Completing booking ID:", bookingId);

    const response = await axiosInstance.put(
      `${Base_Backend_Url}/api/bookings/complete/${bookingId}`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("completeBooking error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

// Combine them into a single object for easy import
const bookingService = {
  // User booking methods
  createBooking,
  getMyBookings,
  fetchBookingDetails,
  cancelBooking,

  // Driver booking methods
  getDriverPendingBookings,
  getDriverBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
};

export default bookingService;