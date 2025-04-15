// userService.js - Updated
import axiosInstance from '../utils/axiosInstance';

export const fetchUserProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    const formattedError = formatError(error);
    throw new Error(formattedError);
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(`/api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    const formattedError = formatError(error);
    throw new Error(formattedError);
  }
};

export const getAllUsersService = async () => {
  try {
    // Changed from "/api/users/all" to "/api/user/all" to match your API
    const response = await axiosInstance.get("/api/users/all");
    console.log("API Response:", response.data);

    // Check for different possible response structures
    if (response.data && response.data.Result && response.data.Result.users_data) {
      console.log("Found users in Result.users_data:", response.data.Result.users_data);
      return response.data.Result.users_data;
    }
    else if (response.data && response.data.result && response.data.result.users_data) {
      console.log("Found users in result.users_data:", response.data.result.users_data);
      return response.data.result.users_data;
    }
    else if (response.data && response.data.Result) {
      console.log("Result object contains:", response.data.Result);
      // If Result exists but doesn't have users_data property
      return response.data.Result;
    }
    else if (response.data && Array.isArray(response.data)) {
      // If the response is directly an array
      return response.data;
    }
    else {
      console.error("Unable to find users data in response:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Service error:", error);
    throw new Error(formatError(error));
  }
};

const formatError = (error) => {
  if (error.response) {
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    return 'No response from server';
  } else {
    return error.message;
  }
};

const userService = {
  fetchUserProfile,
  updateUserProfile,
  getAllUsersService,
};

export default userService;