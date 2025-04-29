import axios from "axios";
import { Base_Backend_Url } from "../../constant";
import formatError from "../utils/errorUtils";
import axiosInstance from "../utils/axiosInstance";

// Submit a new rating
const submitRating = async ({ referenceId, referenceType, rating, review, categoryRatings }) => {
    try {
        const response = await axios.post(
            `${Base_Backend_Url}/api/ratings/submitrating`,
            { referenceId, referenceType, rating, review, categoryRatings },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// Get all ratings for a specific driver
const getDriverRatings = async (driverId, page = 1, limit = 10) => {
    try {
        const response = await axiosInstance.get(
            `${Base_Backend_Url}/api/ratings/getdriverratings/${driverId}?page=${page}&limit=${limit}`,
            { withCredentials: true }
        );
        // Fix: Return response.data instead of the full response object
        return response.data;
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// Get rating summary for a driver
const getDriverRatingSummary = async (driverId) => {
    try {
        // Fix: Corrected the URL path by removing redundant "/summary"
        const response = await axiosInstance.get(
            `${Base_Backend_Url}/api/ratings/getdriverratingsummary/${driverId}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// Get all ratings submitted by current user
const getUserRatings = async (page = 1, limit = 10) => {
    try {
        const response = await axiosInstance.get(
            `${Base_Backend_Url}/api/ratings/getuserratings?page=${page}&limit=${limit}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// Get details for a specific rating
const getRatingById = async (ratingId) => {
    try {
        const response = await axiosInstance.get(
            `${Base_Backend_Url}/api/ratings/getrating/${ratingId}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// Moderate a rating (admin only)
const moderateRating = async (ratingId, { action, reason }) => {
    try {
        const response = await axiosInstance.patch(
            `${Base_Backend_Url}/api/ratings/moderaterating/${ratingId}`,
            { action, reason },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

const ratingService = {
    submitRating,
    getDriverRatings,
    getDriverRatingSummary,
    getUserRatings,
    getRatingById,
    moderateRating
};

export default ratingService;