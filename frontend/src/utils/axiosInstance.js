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
  (error) => Promise.reject(error)
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("🔄 401 Unauthorized - Attempting token refresh...");
      originalRequest._retry = true;
      try {
        console.log("🔄 Dispatching refreshAccessToken...");
        const refreshResponse = await authService.refreshAccessTokenService();
        const newAccessToken = refreshResponse?.data?.accessToken;
        if (!newAccessToken) {
          console.error("❌ Token refresh failed: No new access token found!");
          return Promise.reject(error);
        }
        Cookies.set("accessToken", newAccessToken, { secure: true, sameSite: "strict" });
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        console.log("🔑 New Access Token:", newAccessToken);
        console.log("🔄 Retrying original request with new token...");
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh error:", refreshError);
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    console.error("❌ Request failed, rejecting error...");
    return Promise.reject(error);
  }
);

export default axiosInstance;
