import axios from "axios";
import { Base_Backend_Url } from "../../constant";
import formatError from "../utils/errorUtils";
import axiosInstance from "../utils/axiosInstance";

export const createTrips = async (formData) => {
  try {
    console.log("ENTER THE details");
    const response = await axios.post(
      `http://localhost:3301/api/trips/create`, // Full URL with the backend server's port
      formData,
      {
        withCredentials: true, // Ensure credentials are sent with the request
      }
    );
    
    console.log("The response in create trips:", response);
    
    console.log("The response in create trips:", response);
    

    return response.data;
  } catch (error) {
    console.log("error in trip service", error);
    console.error("CheckAuth error:", error.message);
    throw new Error(error.response?.data || "Trip form failed");
  }
};


  const tripService = {
    createTrips
  };
  
  export default tripService;