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

export const getAllUsersService = async (params = {}) => {
  try {
    // Build query string from params (for pagination, filtering, etc.)
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await axiosInstance.get(`/api/users/all${queryString}`);

    console.log("API Response:", response.data);

    // Handle the specific structure from our updated controller
    if (response.data && response.data.result) {
      // Return the complete result object with stats, pagination and users_data
      return response.data.result;
    } else if (response.data && response.data.Result) {
      // Alternative property name format
      return response.data.Result;
    } else {
      console.warn("Unexpected response format:", response.data);
      // Fallback to return whatever we got
      return response.data;
    }
  } catch (error) {
    console.error("Service error:", error);
    throw new Error(formatError(error));
  }
};

const formatError = (error) => {
  if (error.response) {
    // Try to get the specific error message from our API response format
    if (error.response.data && error.response.data.errors && error.response.data.errors.length) {
      return error.response.data.errors[0].message || 'An error occurred';
    }
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