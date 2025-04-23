import axios from "axios"
import { Base_Backend_Url } from "../../constant"
import formatError from "../utils/errorUtils"
import axiosInstance from "../utils/axiosInstance"
import Cookies from "js-cookie"

// REGISTER SERVICE
const register = async (userData) => {
  try {
    const response = await axios.post(`${Base_Backend_Url}/api/auth/register`, userData)
    return response.data
  } catch (error) {
    console.log(error)
    console.error("Registration error:", error.response?.data?.ErrorMessage || error.message)
    const formattedError = formatError(error)
    console.log("The formatted error in register service is", formattedError)
    throw formattedError
  }
}

// LOGIN SERVICE
const login = async (credentials) => {
  try {
    console.log("Login request with credentials:", JSON.stringify(credentials));

    const response = await axios.post(
      `${Base_Backend_Url}/api/auth/login`,
      credentials,
      {
        withCredentials: true,
      }
    );

    console.log("Login API response:", JSON.stringify(response.data));

    // Save user info in localStorage for persistence
    if (response.data.success || response.data.Result) {
      const userData = response.data.Result?.user_data || response.data.user || {};
      localStorage.setItem('user', JSON.stringify(userData));
    }

    return response.data;
  } catch (error) {
    console.error("Login error details:", error);
    console.error("Response data:", error.response?.data);
    console.error("Response status:", error.response?.status);

    if (error.response && error.response.data) {
      // Return the server's error response directly
      return Promise.reject(error.response.data);
    }

    // For network errors or other issues
    const formattedError = formatError(error);
    console.log("Formatted login error:", formattedError);
    return Promise.reject(formattedError);
  }
};

// LOGOUT SERVICE
const logout = async () => {
  try {
    await axiosInstance.post(`/api/auth/logout`);

    // Clear user data from localStorage
    localStorage.removeItem('user');
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');

    return { success: true }
  } catch (error) {
    console.error("Logout failed:", error.response?.data?.ErrorMessage?.[0]?.message || error.message)

    // Still clear local storage on error
    localStorage.removeItem('user');
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');

    throw new Error(
      error.response?.data?.ErrorMessage?.[0]?.message || error.message || "Logout failed due to internal server error",
    )
  }
}

// CHECK AUTH SERVICE
export const checkAuth = async () => {
  try {
    console.log("ENETERD THE CHECK AUTH SERVICE");
    const response = await axios.get(`${Base_Backend_Url}/api/auth/checkAuth`, {
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error("CheckAuth error:", error.message);
    throw new Error(error.response?.data || "Authentication check failed");
  }
};

const refreshAccessTokenService = async () => {
  try {
    console.log("ATTEMPTING TO REFRESH ACCESS TOKEN");

    const response = await axios.post(
      `${Base_Backend_Url}/api/auth/refresh-token`,
      {},
      {
        withCredentials: true,
      },
    );

    console.log("Token refresh response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Token refresh error:", error);
    throw new Error(error.response?.data || "SERVER ERROR WHILE REFRESHING ACCESS TOKEN");
  }
}

const forgotPassword = async (emailData) => {
  try {
    console.log("Sending forgot password request with:", emailData); // Add this for debugging

    // Make sure we're sending the email in the correct format
    const payload = typeof emailData === 'string' ? { email: emailData } : emailData;

    const response = await axios.post(
      `${Base_Backend_Url}/api/auth/forgotpassword`,
      payload,
      {
        withCredentials: true,
      },
    )
    return response.data
  } catch (error) {
    console.error("Forgot password error:", error.response?.data || error.message);
    const formattedError = formatError(error);
    throw formattedError;
  }
}

// Updated reset password function with correct endpoint
const resetPassword = async (data) => {
  try {
    const response = await axios.post(
      `${Base_Backend_Url}/api/auth/resetpassword`, // Fix: Changed from reset-password to resetpassword
      data,
      {
        withCredentials: true,
      },
    )
    return response.data
  } catch (error) {
    console.error("Reset password error:", error.response?.data || error.message)
    const formattedError = formatError(error)
    throw formattedError
  }
}

const authService = {
  register,
  login,
  logout,
  checkAuth,
  refreshAccessTokenService,
  forgotPassword,
  resetPassword,
}

export default authService