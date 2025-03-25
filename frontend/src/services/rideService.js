// src/services/rideService.js
import axiosInstance from "../utils/axiosInstance";
import { Base_Backend_Url } from "../../constant";
import formatError from "../utils/errorUtils";

/** 
 * POST /api/rides/postride 
 * Driver posts an available ride
 */
const postRide = async (postData) => {
  try {
    // e.g. postData = { driverId, pickupLocation, dropoffLocation, ... }
    const response = await axiosInstance.post(
      `/api/rides/postride`,
      postData
    );
    return response.data; // { success: true, data: ride }
  } catch (error) {
    throw formatError(error);
  }
};

/** 
 * POST /api/rides/requestride 
 * Passenger requests a ride
 */
const requestRide = async (requestData) => {
  try {
    // e.g. requestData = { passengerId, pickupLocation, dropoffLocation, etc. }
    const response = await axiosInstance.post(
      `/api/rides/requestride`,
      requestData
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/** 
 * PUT /api/rides/updateridestatus 
 * Update ride status (requested -> accepted -> picked up -> completed, etc.)
 */
const updateRideStatus = async (statusData) => {
  try {
    // e.g. statusData = { rideId, status, fare, cancelReason }
    const response = await axiosInstance.put(
      `/api/rides/updateridestatus`,
      statusData
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/** 
 * GET /api/rides/ridehistory 
 * Get ride history for a user
 * query params: userId=..., userType=..., page=..., limit=..., status=...
 */
const getRideHistory = async (params) => {
  try {
    // e.g. params = { userId, userType, page, limit, status }
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(
      `/api/rides/ridehistory?${queryString}`
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/** 
 * GET /api/rides/activeride 
 * Get the active ride (if any) for a user
 * query params: { userId, userType }
 */
const getActiveRide = async (params) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(
      `/api/rides/activeride?${queryString}`
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/** 
 * PUT /api/rides/paymentstatus 
 * Update payment status
 */
const updatePaymentStatus = async (paymentData) => {
  try {
    // e.g. paymentData = { rideId, paymentStatus, paymentMethod }
    const response = await axiosInstance.put(
      `/api/rides/paymentstatus`,
      paymentData
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/** 
 * GET /api/rides/searchdrivers 
 * Search for drivers by vehicleType, location, radius
 * query params: { vehicleType, latitude, longitude, radius }
 */
const searchDrivers = async (params) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axiosInstance.get(
      `/api/rides/searchdrivers?${queryString}`
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

/** 
 * POST /api/rides/rateride 
 * Rate a completed ride
 */
const rateRide = async (rateData) => {
  try {
    // e.g. rateData = { rideId, rating, feedback }
    const response = await axiosInstance.post(
      `/api/rides/rateride`,
      rateData
    );
    return response.data;
  } catch (error) {
    throw formatError(error);
  }
};

const getPendingRides = async () => {
  // Just call /api/rides/pending
  const response = await axiosInstance.get("/api/rides/pending");
  return response.data; // { success: true, data: [...] }
};

const rideService = {
  postRide,
  requestRide,
  updateRideStatus,
  getRideHistory,
  getActiveRide,
  updatePaymentStatus,
  searchDrivers,
  rateRide,
  getPendingRides
};

export default rideService;
