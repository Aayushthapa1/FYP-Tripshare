// ratingService.js

import axios from "axios";
import { Base_Backend_Url } from "../../constant";
import formatError from "../utils/errorUtils";
import axiosInstance from "../utils/axiosInstance";

/**
 * Submit a new rating
 * POST /api/ratings/submit
 */
const submitRating = async ({ referenceId, referenceType, rating, review, categoryRatings }) => {
    try {
        console.log("Submitting rating:", { referenceId, referenceType, rating });

        const response = await axiosInstance.post(
            `${Base_Backend_Url}/api/ratings/submit`,
            { referenceId, referenceType, rating, review, categoryRatings },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("submitRating error:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

/**
 * Get all ratings for a specific driver
 * GET /api/ratings/driver/:driverId
 */
const getDriverRatings = async (driverId, page = 1, limit = 10) => {
    try {
        console.log("Fetching ratings for driver:", driverId);

        const response = await axiosInstance.get(
            `${Base_Backend_Url}/api/ratings/driver/${driverId}?page=${page}&limit=${limit}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("getDriverRatings error:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

/**
 * Get rating summary for a driver
 * GET /api/ratings/driver/:driverId/summary
 */
const getDriverRatingSummary = async (driverId) => {
    try {
        console.log("Fetching rating summary for driver:", driverId);

        const response = await axiosInstance.get(
            `${Base_Backend_Url}/api/ratings/driver/${driverId}/summary`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("getDriverRatingSummary error:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

/**
 * Get all ratings submitted by the current user
 * GET /api/ratings/user/me
 */
const getUserRatings = async (page = 1, limit = 10) => {
    try {
        console.log("Fetching my submitted ratings");

        const response = await axiosInstance.get(
            `${Base_Backend_Url}/api/ratings/user/me?page=${page}&limit=${limit}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("getUserRatings error:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

/**
 * Get details for a specific rating
 * GET /api/ratings/:ratingId
 */
const getRatingById = async (ratingId) => {
    try {
        console.log("Fetching rating details for ID:", ratingId);

        const response = await axiosInstance.get(
            `${Base_Backend_Url}/api/ratings/${ratingId}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("getRatingById error:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

/**
 * Update an existing rating
 * PUT /api/ratings/update/:ratingId
 */
const updateRating = async (ratingId, { rating, review, categoryRatings }) => {
    try {
        console.log("Updating rating ID:", ratingId);

        const response = await axiosInstance.put(
            `${Base_Backend_Url}/api/ratings/update/${ratingId}`,
            { rating, review, categoryRatings },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("updateRating error:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

/**
 * Delete a rating
 * DELETE /api/ratings/delete/:ratingId
 */
const deleteRating = async (ratingId) => {
    try {
        console.log("Deleting rating ID:", ratingId);

        const response = await axiosInstance.delete(
            `${Base_Backend_Url}/api/ratings/delete/${ratingId}`,
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("deleteRating error:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

/**
 * Admin: Moderate a rating
 * PATCH /api/ratings/moderate/:ratingId
 */
const moderateRating = async (ratingId, { action, reason }) => {
    try {
        console.log(`Moderating rating ID: ${ratingId}, Action: ${action}`);

        const response = await axiosInstance.patch(
            `${Base_Backend_Url}/api/ratings/moderate/${ratingId}`,
            { action, reason },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error("moderateRating error:", error);
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// Combine them into a single object for easy import
const ratingService = {
    submitRating,
    getDriverRatings,
    getDriverRatingSummary,
    getUserRatings,
    getRatingById,
    updateRating,
    deleteRating,
    moderateRating
};

export default ratingService;