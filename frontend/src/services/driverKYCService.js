// driverKYCService.js
import axiosInstance from "../utils/axiosInstance";
import formatError from "../utils/errorUtils";

/**
 * Submit new KYC (driver side)
 * POST /api/drivers
 */
export const submitDriverKYC = async (data) => {
    try {
        // data can be FormData or JSON, depending on how you're sending it
        const response = await axiosInstance.post("/api/drivers", data);
        // The server should return { success: true, data: createdDoc }
        return response.data.data; // Return just the doc or entire payload
    } catch (error) {
        throw formatError(error);
    }
};

/**
 * Get all KYC submissions (admin side)
 * GET /api/drivers
 * You can pass queries like status, sort, page, limit
 */
export const getAllDriverKYCs = async (params = {}) => {
    try {
        // For pagination or filters: e.g. { status: 'pending', page: 2, limit: 20 }
        const response = await axiosInstance.get("/api/drivers", {
            params,
        });
        // The server returns { success: true, data: [...] } plus pagination info
        return response.data.data; // or entire response.data if you need pagination
    } catch (error) {
        throw formatError(error);
    }
};

/**
 * Get single KYC submission by ID
 * GET /api/drivers/:id
 */
export const getDriverKYCById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/drivers/${id}`);
        // The server returns { success: true, data: doc }
        return response.data.data;
    } catch (error) {
        throw formatError(error);
    }
};

/**
 * Update KYC information (driver side)
 * PUT /api/drivers/:id
 */
export const updateDriverKYC = async (id, data) => {
    try {
        const response = await axiosInstance.put(`/api/drivers/${id}`, data);
        // The server returns { success: true, data: updatedDoc }
        return response.data.data;
    } catch (error) {
        throw formatError(error);
    }
};

/**
 * Update KYC status (admin side)
 * PATCH /api/drivers/:id/status
 */
export const updateKYCStatus = async (id, statusData) => {
    try {
        const response = await axiosInstance.patch(
            `/api/drivers/${id}/status`,
            statusData
        );
        // The server returns { success: true, data: updatedDoc }
        return response.data.data;
    } catch (error) {
        throw formatError(error);
    }
};

/**
 * Delete a KYC record (admin side)
 * DELETE /api/drivers/:id
 */
export const deleteDriverKYC = async (id) => {
    try {
        const response = await axiosInstance.delete(`/api/drivers/${id}`);
        // The server returns { success: true, message: "..." }
        // No doc in .data if we just remove it. Return nothing or the entire response
        return response.data; // e.g. { success: true, message: '...' }
    } catch (error) {
        throw formatError(error);
    }
};
