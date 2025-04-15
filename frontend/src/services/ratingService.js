// services/ratingService.js

import axiosInstance from "../utils/axiosInstance";
import { Base_Backend_Url } from "../../constant";
import formatError from "../utils/errorUtils";

const createRating = async (rideId, { rating, feedback }) => {
    if (!rideId) throw new Error("Ride ID is required.");
    if (rating < 1 || rating > 5)
        throw new Error("Rating must be between 1 and 5.");

    try {
        const response = await axiosInstance.post(
            `${Base_Backend_Url}/api/ratings/${rideId}`,
            { rating, feedback },
            { withCredentials: true }
        );
        return response.data; // { message: '...', rating: {...} }
    } catch (error) {
        throw formatError(error);
    }
};

const getDriverRatings = async (driverId) => {
    if (!driverId) throw new Error("Driver ID is required.");
    try {
        const response = await axiosInstance.get(
            `${Base_Backend_Url}/api/ratings/driver/${driverId}`,
            { withCredentials: true }
        );
        return response.data; // { message, averageRating, count, ratings[] }
    } catch (error) {
        throw formatError(error);
    }
};

const getRideRatings = async (rideId) => {
    if (!rideId) throw new Error("Ride ID is required.");
    try {
        const response = await axiosInstance.get(
            `${Base_Backend_Url}/api/ratings/ride/${rideId}`,
            { withCredentials: true }
        );
        return response.data; // { message, ratings[] }
    } catch (error) {
        throw formatError(error);
    }
};

const ratingService = {
    createRating,
    getDriverRatings,
    getRideRatings,
};

export default ratingService;
