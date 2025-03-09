import axios from "axios";
import { Base_Backend_Url } from "../../constant";
import Cookies from "js-cookie";
import authService from "../services/authService";

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: Base_Backend_Url,
  withCredentials: true,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ Response received:", response);
    return response;
  },
  async (error) => {
    console.error("❌ Axios Error:", error);

    const originalRequest = error.config;

    // Check for 401 Unauthorized error
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("🔄 401 Unauthorized - Attempting token refresh...");

      originalRequest._retry = true;

      try {
        console.log("🔄 Dispatching refreshAccessToken...");

        // Call the refresh token service
        const refreshResponse = await authService.refreshAccessTokenService();
        const newAccessToken = refreshResponse?.data?.accessToken;

        if (!newAccessToken) {
          console.error("❌ Token refresh failed: No new access token found!");
          return Promise.reject(error);
        }

        // Update the access token in cookies
        Cookies.set("accessToken", newAccessToken, { secure: true, sameSite: "strict" });

        // Update the Authorization header
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        console.log("🔑 New Access Token:", newAccessToken);
        console.log("🔄 Retrying original request with new token...");

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh error:", refreshError);

        // Clear tokens and redirect to login if refresh fails
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        window.location.href = "/login"; // Redirect to login page
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    console.error("❌ Request failed, rejecting error...");
    return Promise.reject(error);
  }
);

export default axiosInstance;