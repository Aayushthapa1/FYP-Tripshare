import axios from "axios"
import { Base_Backend_Url } from "../../constant"
import formatError from "../utils/errorUtils"
import axiosInstance from "../utils/axiosInstance"

// REGISTER SERVICE
const register = async (userData) => {
  try {
    const response = await axios.post(`${Base_Backend_Url}/api/auth/register`, userData)
    return response.data
  } catch (error) {
    console.log(error)
    console.error("Registration error:", error.response?.data?.ErrorMessage || error.message)
    const formattedError = formatError(error)
    console.log("The fromatted error in register servvice is", formattedError)
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
    await axiosInstance.post(`/api/auth/logout`)
    return { success: true }
  } catch (error) {
    console.error("Logout failed:", error.response?.data?.ErrorMessage?.[0]?.message || error.message)
    throw new Error(
      error.response?.data?.ErrorMessage?.[0]?.message || error.message || "Logout failed due to internal server error",
    )
  }
}

// CHECK AUTH SERVICE
const checkAuth = async () => {
  try {
    console.log("ENTERED THE CHECK AUTH SERVICE")
    const response = await axios.get(`${Base_Backend_Url}/api/auth/checkAuth`, {
      withCredentials: true,
    })

    return response.data
  } catch (error) {
    console.error("CheckAuth error:", error.message)
    throw new Error(error.response?.data || "Authentication check failed")
  }
}

const refreshAccessTokenService = async () => {
  try {
    const response = await axios.post(
      `${Base_Backend_Url}/api/auth/refresh-token`,
      {},
      {
        withCredentials: true,
      },
    )

    return response.data
  } catch (error) {
    throw new Error(error.response?.data || "SERVER ERROR WHILE REFRESHING ACCESS TOKEN")
  }
}

// Add these functions to match the thunks in your slice
const forgotpassword = async (email) => {
  try {
    const response = await axios.post(
      `${Base_Backend_Url}/api/auth/forgot-password`,
      { email },
      {
        withCredentials: true,
      },
    )
    return response.data
  } catch (error) {
    const formattedError = formatError(error)
    throw formattedError
  }
}

const resetpassword = async (data) => {
  try {
    const response = await axios.post(`${Base_Backend_Url}/api/auth/reset-password`, data, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
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
  forgotpassword,
  resetpassword,
}

export default authService