// bookingService.js

import axios from "axios";
import { Base_Backend_Url } from "../../constant";
import formatError from "../utils/errorUtils";
import axiosInstance from "../utils/axiosInstance";

/**
 * CREATE a booking
 * POST /api/bookings
 */
const createBooking = async ({ tripId, seats, paymentMethod }) => {
  try {
    console.log("Creating booking with data:", { tripId, seats, paymentMethod });

    // If your backend requires auth headers/cookies, use axiosInstance
    const response = await axiosInstance.post(
      `${Base_Backend_Url}/api/bookings`,
      { tripId, seats, paymentMethod },
      {
        withCredentials: true, // If cookies/sessions are needed
      }
    );

    // Return the entire server response or shape it as you prefer
    return response.data;
  } catch (error) {
    console.error("createBooking error:", error);
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
      `${Base_Backend_Url}/api/bookings/my`,
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
 * PATCH /api/bookings/:bookingId/cancel
 */
const cancelBooking = async (bookingId) => {
  try {
    console.log("Cancelling booking for ID:", bookingId);

    const response = await axiosInstance.patch(
      `${Base_Backend_Url}/api/bookings/${bookingId}/cancel`,
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

// Combine them into a single object for easy import
const bookingService = {
  createBooking,
  getMyBookings,
  fetchBookingDetails,
  cancelBooking,
};

export default bookingService;
