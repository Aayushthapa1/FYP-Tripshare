import axios from "axios";
import { refreshAccessToken } from "../authSetup";
import { Base_Backend_Url } from "../../constant";
import Cookies from "js-cookie";
import { store } from "../authSetup";

const axiosInstance = axios.create({
  baseURL: Base_Backend_Url,
  withCredentials: true,
});

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("✅ Response received:", response);
    return response;
  },
  async (error) => {
    console.error("❌ Axios Error:", error);

    const originalRequest = error.config;
    console.log("🔄 Retrying request?", originalRequest._retry);

    if (error.response) {
      console.log("⚠️ Error Response Data:", error.response.data);
      console.log("⚠️ Error Status Code:", error.response.status);
    }

    if (error.response.status === 401 && !originalRequest._retry) {
      console.warn("🔄 401 Unauthorized - Attempting token refresh...");

      originalRequest._retry = true;

      try {
        console.log("🔄 Dispatching refreshAccessToken...");
        await store.dispatch(refreshAccessToken());

        const newAccessToken = Cookies.get("accessToken");
        console.log("🔑 New Access Token:", newAccessToken);

        if (!newAccessToken) {
          console.error("❌ Token refresh failed: No new access token found!");
          return Promise.reject(error);
        }

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        console.log("🔄 Retrying original request with new token...");

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh error:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    console.error("❌ Request failed, rejecting error...");
    return Promise.reject(error);
  }
);

export default axiosInstance;
