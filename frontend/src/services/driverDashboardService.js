

import axiosInstance from "../utils/axiosInstance"
import { Base_Backend_Url } from "../../constant"
import formatError from "../utils/errorUtils"

/**
 * Get driver stats for the given query params.
 * This calls /api/trips/stats?period=xxx&startDate=xxx&endDate=xxx
 */
const getDriverStats = async (params = {}) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append("period", params.period);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = `${Base_Backend_Url}/api/trips/stats${queryString ? `?${queryString}` : ""}`;

    const response = await axiosInstance.get(url);
    return response.data; // This should be the entire response from your controller
  } catch (error) {
    console.error("Trip stats error:", error.response?.data?.ErrorMessage || error.message);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * For a future, more complex driver dashboard,
 * you can make multiple parallel requests here.
 * For now, we just call getDriverStats in Promise.all
 */
const getAllDriverDashboardStats = async (params = {}) => {
  try {
  

    // For now, just call getDriverStats directly:
    const [tripStats] = await Promise.all([
      getDriverStats(params)
    ]);

    // If your controller returns { success, data: {...} } or something similar,
    // you can shape the combined result as you wish. For example:
    return {
      success: true,
      // Either directly return the tripStats data,
      // or place it under a specific key if you want:
      data: tripStats.data || tripStats.Result || tripStats
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

const tripStatsService = {
  getDriverStats,
  getAllDriverDashboardStats
};

export default tripStatsService;
