import axios from "axios";
import { refreshAccessToken } from "../authSetup";
import { Base_Backend_Url } from "../../constant";
import Cookies from "js-cookie";
import {store} from "../authSetup";

const axiosInstance = axios.create({
  baseURL: Base_Backend_Url,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      await store.dispatch(refreshAccessToken());

      const newAccessToken = Cookies.get("accessToken");
      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

      return axiosInstance(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
