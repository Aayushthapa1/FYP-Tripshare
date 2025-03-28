

import axiosInstance from '../utils/axiosInstance';
// Assuming you have an axios instance configured

export const fetchUserProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/api/user/${userId}`);
    return response.data;
  } catch (error) {
    const formattedError = formatError(error);
    throw new Error(formattedError);
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(`/api/user/${userId}`, userData);
    return response.data;
  } catch (error) {
    const formattedError = formatError(error);
    throw new Error(formattedError);
  }
};

export const getAllUsersService = async () => {
  try {
    const response = await axiosInstance.get("/api/user/all");
    return response.data.result.users_data; 
  } catch (error) {
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

const userService
  = {
    fetchUserProfile,
    updateUserProfile,
    getAllUsersService,
  };

export default userService