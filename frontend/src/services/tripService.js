import axios from "axios";
import { Base_Backend_Url } from "../../constant";
import formatError from "../utils/errorUtils";
import axiosInstance from "../utils/axiosInstance";

export const createTrips = async () => {
    try {
      console.log("ENETER THE details");
      const response = await axios.get(`${Base_Backend_Url}/api/trips/create`, {
        withCredentials: true,
      });
  
      return response.data;
    } catch (error) {
      console.error("CheckAuth error:", error.message);
      throw new Error(error.response?.data || "Tripform failed");
    }
  };

  const tripService = {
    createTrips
  };
  
  export default tripService;