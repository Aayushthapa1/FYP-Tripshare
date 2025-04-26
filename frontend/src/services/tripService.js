// src/services/tripService.js
import axiosInstance from "../utils/axiosInstance";
import formatError from "../utils/errorUtils";

const handleResponse = (response) => {
  if (!response.data) {
    throw new Error("No data received from server");
  }
  return response.data;
};

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
    return data.Result?.trip;
  } catch (error) {
    throw handleError(error);
  }
};

/** GET ALL TRIPS (GET /api/trips/all) */
export const getTrips = async () => {
  try {
    const response = await axiosInstance.get("/api/trips/getalltrips");
    const data = handleResponse(response);
    // Sort trips by creation date (newest first) if they have createdAt field
    const trips = data.Result?.trips || [];
    return trips.sort((a, b) => {
      // If createdAt exists, use it, otherwise extract timestamp from MongoDB _id
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
      return dateB - dateA; // Newest first
    });
  } catch (error) {
    throw handleError(error);
  }
};

/** GET TRIP BY ID (GET /api/trips/:tripId) */
export const getTripById = async (tripId) => {
  try {
    const response = await axiosInstance.get(`/api/trips/getsingletrip/${tripId}`);
    const data = handleResponse(response);
    return data.Result?.trip || null;
  } catch (error) {
    throw handleError(error);
  }
};

/** UPDATE TRIP (PUT /api/trips/:tripId) */
export const updateTrip = async (tripId, formData) => {
  try {
    const response = await axiosInstance.put(`/api/trips/updatetrip/${tripId}`, formData);
    const data = handleResponse(response);
    return data.Result?.trip || null;
  } catch (error) {
    throw handleError(error);
  }
};

/** COMPLETE TRIP (POST /api/trips/markascomplete/:tripId) */
export const completeTrip = async (tripId, completionDetails = {}) => {
  try {
    const response = await axiosInstance.post(`/api/trips/markascomplete/${tripId}`, completionDetails);
    console.log("Trip completed:", response);
    const data = handleResponse(response);
    return data.Result?.trip || null;
  } catch (error) {
    throw handleError(error);
  }
};

/** DELETE TRIP (DELETE /api/trips/:tripId) */
export const deleteTrip = async (tripId) => {
  try {
    const response = await axiosInstance.delete(`/api/trips/deletetrip/${tripId}`);
    const data = handleResponse(response);
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
    const trips = data.Result?.trips || [];
    // Sort search results by creation date as well
    return trips.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
      return dateB - dateA;
    });
  } catch (error) {
    throw handleError(error);
  }
};

/** GET DRIVER TRIPS (GET /api/trips/my-trips) */
export const getDriverTrips = async () => {
  try {
    const response = await axiosInstance.get("/api/trips/my-trips");
    const data = handleResponse(response);
    const trips = data.Result?.trips || [];
    // Sort driver trips by creation date
    return trips.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
      return dateB - dateA;
    });
  } catch (error) {
    throw handleError(error);
  }
};

/** GET DRIVER TRIP STATS (GET /api/trips/stats) */
export const getDriverTripStats = async (params) => {
  try {
    const response = await axiosInstance.get("/api/trips/stats", {
      params
    });
    const data = handleResponse(response);
    return data.Result || {};
  } catch (error) {
    throw handleError(error);
  }
};

/** CLEAN UP EXPIRED TRIPS (DELETE /api/trips/cleanup) */
export const cleanupExpiredTrips = async () => {
  try {
    const response = await axiosInstance.delete("/api/trips/cleanup");
    const data = handleResponse(response);
    return data.Result || { removedCount: 0 };
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
  completeTrip,
  searchTrips,
  getDriverTrips,
  getDriverTripStats,
  cleanupExpiredTrips
};