import axios from "axios"
import { Base_Backend_Url } from "../../constant"
import formatError from "../utils/errorUtils"
import axiosInstance from "../utils/axiosInstance"

const requestRide = async (rideData) => {
  try {
    console.log("Requesting ride with data:", JSON.stringify(rideData));
    
    const response = await axiosInstance.post(
      `${Base_Backend_Url}/api/rides/requestride`,
      rideData
    );
    console.log("Request ride API response:", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Request ride error details:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);
    
    const formattedError = formatError(error);
    console.log("Formatted request ride error:", formattedError);
    throw formattedError;
  }
};


const updateRideStatus = async (updateData) => {
  try {
    console.log("Updating ride status with data:", JSON.stringify(updateData));
    
    const response = await axiosInstance.put(
      `${Base_Backend_Url}/api/rides/updateridestatus`,
      updateData
    );
    
    console.log("Update ride status API response:", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Update ride status error details:", error);
    console.error("Response data:", error.response?.data);
    
    const formattedError = formatError(error);
    console.log("Formatted update ride status error:", formattedError);
    throw formattedError;
  }
};


const getActiveRide = async (params) => {
  try {
    console.log("Fetching active ride with params:", JSON.stringify(params));
    
    const response = await axiosInstance.get(
      `${Base_Backend_Url}/api/rides/activeride`,
      { params }
    );
    
    console.log("Get active ride API response:", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Get active ride error details:", error);
    console.error("Response data:", error.response?.data);
    
    // If 404 (no active ride), let the thunk handle it
    if (error.response && error.response.status === 404) {
      throw { status: 404, message: "No active ride found" };
    }
    
    const formattedError = formatError(error);
    console.log("Formatted get active ride error:", formattedError);
    throw formattedError;
  }
};


const getRideHistory = async (params) => {
  try {
    console.log("Fetching ride history with params:", JSON.stringify(params));
    
    const response = await axiosInstance.get(
      `${Base_Backend_Url}/api/rides/ridehistory`,
      { params }
    );
    
    console.log("Get ride history API response:", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Get ride history error details:", error);
    console.error("Response data:", error.response?.data);
    
    const formattedError = formatError(error);
    console.log("Formatted get ride history error:", formattedError);
    throw formattedError;
  }
};


const searchDrivers = async (params) => {
  try {
    console.log("Searching drivers with params:", JSON.stringify(params));
    
    const response = await axiosInstance.get(
      `${Base_Backend_Url}/api/rides/searchdrivers`,
      { params }
    );
    
    console.log("Search drivers API response:", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Search drivers error details:", error);
    console.error("Response data:", error.response?.data);
    
    const formattedError = formatError(error);
    console.log("Formatted search drivers error:", formattedError);
    throw formattedError;
  }
};


const updatePaymentStatus = async (paymentData) => {
  try {
    console.log("Updating payment status with data:", JSON.stringify(paymentData));
    
    const response = await axiosInstance.put(
      `${Base_Backend_Url}/api/rides/paymentstatus`,
      paymentData
    );
    
    console.log("Update payment status API response:", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Update payment status error details:", error);
    console.error("Response data:", error.response?.data);
    
    const formattedError = formatError(error);
    console.log("Formatted update payment status error:", formattedError);
    throw formattedError;
  }
};


const rateRide = async (ratingData) => {
  try {
    console.log("Rating ride with data:", JSON.stringify(ratingData));
    
    const response = await axiosInstance.post(
      `${Base_Backend_Url}/api/rides/rateride`,
      ratingData
    );
    
    console.log("Rate ride API response:", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Rate ride error details:", error);
    console.error("Response data:", error.response?.data);
    
    const formattedError = formatError(error);
    console.log("Formatted rate ride error:", formattedError);
    throw formattedError;
  }
};


const postRide = async (rideData) => {
  try {
    console.log("Posting ride with data:", JSON.stringify(rideData));
    
    const response = await axiosInstance.post(
      `${Base_Backend_Url}/api/rides/postride`,
      rideData
    );
    
    console.log("Post ride API response:", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Post ride error details:", error);
    console.error("Response data:", error.response?.data);
    
    const formattedError = formatError(error);
    console.log("Formatted post ride error:", formattedError);
    throw formattedError;
  }
};


const calculateFareEstimate = async (rideData) => {
  try {
    console.log("Calculating fare estimate with data:", JSON.stringify(rideData));
    
    const response = await axiosInstance.post(
      `${Base_Backend_Url}/api/rides/estimate-fare`,
      rideData
    );
    
    console.log("Calculate fare estimate API response:", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Calculate fare estimate error details:", error);
    console.error("Response data:", error.response?.data);
    
    const formattedError = formatError(error);
    console.log("Formatted calculate fare estimate error:", formattedError);
    throw formattedError;
  }
};


const getRideById = async (rideId) => {
  try {
    console.log("Fetching ride by ID:", rideId);
    
    const response = await axiosInstance.get(
      `${Base_Backend_Url}/api/rides/${rideId}`
    );
    
    console.log("Get ride by ID API response:", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error("Get ride by ID error details:", error);
    console.error("Response data:", error.response?.data);
    
    const formattedError = formatError(error);
    console.log("Formatted get ride by ID error:", formattedError);
    throw formattedError;
  }
};

const rideService = {
  requestRide,
  updateRideStatus,
  getActiveRide,
  getRideHistory,
  searchDrivers,
  updatePaymentStatus,
  rateRide,
  postRide,
  calculateFareEstimate,
  getRideById
};

export default rideService;