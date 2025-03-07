import axios from "axios";
import { Base_Backend_Url } from "../../constant";
import formatError from "../utils/errorUtils";
import axiosInstance from "../utils/axiosInstance";

// REGISTER SERVICE
const register = async (userData) => {
  try {
    const response = await axios.post(
      `${Base_Backend_Url}/api/auth/register`,
      userData
    );
    return response.data;
  } catch (error) {
    console.log(error);
    console.error(
      "Registration error:",
      error.response?.data?.ErrorMessage || error.message
    );
    const formattedError = formatError(error);
    console.log("The fromatted error in register servvice is", formattedError);
    throw formattedError;
  }
};

// LOGIN SERVICE
const login = async (credentials) => {
  try {
    const response = await axios.post(
      `${Base_Backend_Url}/api/auth/login`,
      credentials,
      {
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    const formattedError = formatError(error);

    throw formattedError;
  }
};
// LOGOUT SERVICE
const logout = async () => {
  try {
    await axiosInstance.post(`/api/auth/logout`);
  } catch (error) {
    console.error(
      "Logout failed:",
      error.response.data?.ErrorMessage[0].message || error.message
    );
    throw new Error(
      error.response?.data?.ErrorMessage[0].message ||
      error.message ||
      "Logout failed due to internal server error"
    );
  }
};

// CHECK AUTH SERVICE
export const checkAuth = async () => {
  try {
    console.log("ENETERD THE CHECK AUTH SERVICE");
    const response = await axiosInstance.get(`/api/auth/checkAuth`);

    return response.data;
  } catch (error) {
    console.error("CheckAuth error:", error);
    throw new Error(error.response?.data || "Authentication check failed");
  }
};

export const refreshAccessTokenService = async () => {
  try {
    const response = await axios.post(

      `${Base_Backend_Url}/api/auth/refresh-token`,
      {},
      {
        withCredentials: true,
      }
    );
    console.log(response)
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error(
      error.response?.data || "SERVER ERROR WHILE REFRESHING ACCES TOEKEN"
    );
   
  }
};



const authService = {
  register,
  login,
  logout,
  checkAuth,
  refreshAccessTokenService,
};

export default authService;