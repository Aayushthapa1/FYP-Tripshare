// src/services/tripService.js
import axiosInstance from "../utils/axiosInstance";
import formatError from "../utils/errorUtils";

/**
 * handleResponse checks the shape coming back from your server:
 * {
 *   StatusCode: 200,
 *   IsSuccess: true,
 *   ErrorMessage: [],
 *   Result: {
 *     trips: [] or trip: {}
 *   }
 * }
 */
const handleResponse = (response) => {
  // e.g. response.data = that top-level object
  if (!response.data) {
    throw new Error("No data received from server");
  }
  return response.data; // We'll just return it raw
};

/**
 * handleError prints the error and throws a new error with
 * the relevant message so your slice can catch it.
 */
const handleError = (error) => {
  if (error.response) {
    const formattedError = formatError(error.response.data);
    console.error("API Error:", formattedError);
    throw new Error(formattedError);
  } else if (error.request) {
    throw new Error("No response received from the server");
  } else {
    throw new Error("Request setup error: " + error.message);
  }
};

/** CREATE TRIP (POST /api/trips/create) */
export const createTrip = async (formData) => {
  try {
    const response = await axiosInstance.post("/api/trips/create", formData);
    const data = handleResponse(response);
    // data.Result.trip => newly created trip object
    return data.Result?.trip;
  } catch (error) {
    throw handleError(error);
  }
};

/** GET ALL TRIPS (GET /api/trips/all) */
export const getTrips = async () => {
  try {
    const response = await axiosInstance.get("/api/trips/all");
    const data = handleResponse(response);
    // data.Result.trips => array of trip objects
    return data.Result?.trips || [];
  } catch (error) {
    throw handleError(error);
  }
};

/** GET TRIP BY ID (GET /api/trips/:tripId) */
export const getTripById = async (tripId) => {
  try {
    const response = await axiosInstance.get(`/api/trips/${tripId}`);
    const data = handleResponse(response);
    // data.Result.trip => single trip
    return data.Result?.trip || null;
  } catch (error) {
    throw handleError(error);
  }
};

/** UPDATE TRIP (PUT /api/trips/:tripId) */
export const updateTrip = async (tripId, formData) => {
  try {
    const response = await axiosInstance.put(`/api/trips/${tripId}`, formData);
    const data = handleResponse(response);
    // data.Result.trip => updated trip
    return data.Result?.trip || null;
  } catch (error) {
    throw handleError(error);
  }
};

/** DELETE TRIP (DELETE /api/trips/:tripId) */
export const deleteTrip = async (tripId) => {
  try {
    const response = await axiosInstance.delete(`/api/trips/${tripId}`);
    const data = handleResponse(response);
    // For delete, we might just return the tripId
    // or check if there's a message in data.Result.message
    return tripId;
  } catch (error) {
    throw handleError(error);
  }
};

/** SEARCH TRIPS (GET /api/trips/search?...) */
export const searchTrips = async (searchParams) => {
  try {
    const response = await axiosInstance.get("/api/trips/search", {
      params: searchParams,
    });
    const data = handleResponse(response);
    // data.Result.trips => array
    return data.Result?.trips || [];
  } catch (error) {
    throw handleError(error);
  }
};

/** GET DRIVER TRIPS (GET /api/trips/my-trips) */
export const getDriverTrips = async () => {
  try {
    const response = await axiosInstance.get("/api/trips/my-trips");
    const data = handleResponse(response);
    return data.Result?.trips || [];
  } catch (error) {
    throw handleError(error);
  }
};

/** BOOK SEAT (POST /api/trips/:tripId/book-seat) */
export const bookSeat = async (tripId) => {
  try {
    const response = await axiosInstance.post(`/api/trips/${tripId}/book-seat`);
    console.log(response)
    const data = handleResponse(response);
    // data.Result.trip => updated trip
    return data.Result?.trip || null;
  } catch (error) {
    throw handleError(error);
  }
};

export default {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  searchTrips,
  getDriverTrips,
  bookSeat,
};
