import axios from "axios";
import { Base_Backend_Url } from "../../constant";
import Cookies from "js-cookie";
import authService from "../services/authService";

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: Base_Backend_Url,
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  }
});

// Special handling for PATCH requests to prevent CORS issues
const originalPatch = axiosInstance.patch;
axiosInstance.patch = function patchWithFallback(url, data, config) {
  // Try original PATCH first
  return originalPatch.call(this, url, data, config)
    .catch((error) => {
      // If CORS error, fallback to PUT with method override
      if (error.message && error.message.includes('CORS')) {
        console.warn("⚠️ PATCH CORS issue detected, using PUT with override...");
        return axiosInstance.put(
          url,
          data,
          {
            ...config,
            headers: {
              ...config?.headers,
              'X-HTTP-Method-Override': 'PATCH'
            }
          }
        );
      }
      return Promise.reject(error);
    });
};

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const accessToken = Cookies.get("accessToken");

    // Add authorization header if token exists
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // Include timestamp in requests to prevent caching issues
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    // Log the request for debugging (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🚀 ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ Response from ${response.config.url}:`,
        response.status,
        response.data ? 'Data received' : 'No data'
      );
    }
    return response;
  },
  async (error) => {
    // Get the original request that caused the error
    const originalRequest = error.config;

    // Implement token refresh logic for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("🔄 Access token expired, attempting refresh...");

        // Call refresh token API
        const refreshResponse = await authService.refreshAccessTokenService();

        // Check if we have a new token
        const newAccessToken = refreshResponse?.data?.result?.accessToken ||
          refreshResponse?.data?.accessToken;

        if (!newAccessToken) {
          throw new Error("No access token returned from refresh endpoint");
        }

        // Store the new token
        Cookies.set("accessToken", newAccessToken, {
          secure: process.env.NODE_ENV === 'production',
          sameSite: "strict"
        });

        // Update the failed request with new token
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Retry the original request with new token
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("❌ Token refresh failed:", refreshError);

        // Clear authentication data
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");

        // Dispatch event for auth state tracking
        const authEvent = new CustomEvent('auth:logout', {
          detail: { reason: 'token_refresh_failed' }
        });
        window.dispatchEvent(authEvent);

        // Redirect to login
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);

        return Promise.reject(refreshError);
      }
    }

    // Specific error handling for different status codes
    if (error.response) {
      // Log more detailed error information
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} failed:`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });

      // Handle specific status codes
      switch (error.response.status) {
        case 403:
          console.error("❌ Permission denied (403)");
          break;
        case 404:
          console.error(`❌ Resource not found (404): ${error.config.url}`);
          break;
        case 422:
          console.error("❌ Validation error (422):", error.response.data);
          break;
        case 500:
          console.error("❌ Server error (500)");
          break;
      }
    } else if (error.request) {
      // Request was made but no response was received
      console.error("❌ No response received:", {
        url: error.config?.url,
        method: error.config?.method
      });

      // Check for network connectivity issues
      if (!navigator.onLine) {
        console.error("❌ Network connectivity issue detected");
        // You could dispatch an event here to show a network error UI
      }
    } else {
      // Error in setting up the request
      console.error("❌ Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Add cancel token support
axiosInstance.cancelToken = axios.CancelToken;
axiosInstance.isCancel = axios.isCancel;

// Add helper to create pre-configured instances
axiosInstance.createInstance = (config) => {
  return axios.create({
    ...axiosInstance.defaults,
    ...config,
  });
};

export default axiosInstance;