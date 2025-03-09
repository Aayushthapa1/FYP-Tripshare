
import axiosInstance from "../utils/axiosInstance";
import formatError from "../utils/errorUtils";

export const createTrip = async (formData) => {
  try {
    const response = await axiosInstance.post(
      "/api/trips/create",
      formData
    );
    return response.data;
  } catch (error) {
    const formattedError = formatError(error);
    console.error("Create trip error:", formattedError);
    throw new Error(formattedError);
  }
};

export const getTrips = async () => {
  try {
    const response = await axiosInstance.get("/api/trips/all");
    return response.data;
  } catch (error) {
    const formattedError = formatError(error);
    throw new Error(formattedError);
  }
};

export const getTripById = async (tripId) => {
  try {
    const response = await axiosInstance.get(`/api/trips/${tripId}`);
    return response.data;
  } catch (error) {
    const formattedError = formatError(error);
    throw new Error(formattedError);
  }
};

export const updateTrip = async (tripId, formData) => {
  try {
    const response = await axiosInstance.put(
      `/api/trips/${tripId}`,
      formData
    );
    return response.data;
  } catch (error) {
    const formattedError = formatError(error);
    throw new Error(formattedError);
  }
};

export const deleteTrip = async (tripId) => {
  try {
    const response = await axiosInstance.delete(`/api/trips/${tripId}`);
    return response.data;
  } catch (error) {
    const formattedError = formatError(error);
    throw new Error(formattedError);
  }
};

const tripService = {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip
};

export default tripService;