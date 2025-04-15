import axiosInstance from "../utils/axiosInstance";
import formatError from "../utils/errorUtils";

/**
 * Submit new KYC (driver side)
 * POST /api/drivers/create
 */
export const submitDriverKYC = async (formData) => {
    try {
        const response = await axiosInstance.post("/api/drivers/create", formData);
        return response.data.data; // the newly created doc
    } catch (error) {
        throw formatError(error);
    }
};

/**
 * Get all KYC submissions (admin side)
 * GET /api/drivers/all
 */
export const getAllDriverKYCs = async (params = {}) => {
    try {
        const response = await axiosInstance.get("/api/drivers/all", { params });
        return {
            data: response.data.data,
            pagination: response.data.pagination || {
                page: 1,
                limit: 10,
                total: response.data.total || 0,
                totalPages: response.data.totalPages || 1,
            },
        };
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
        return response.data.data;
    } catch (error) {
        throw formatError(error);
    }
};

/**
 * Get KYC submission by user ID
 * GET /api/drivers/user/:userId
 */
export const getDriverKYCByUser = async (userId) => {
    try {
        const response = await axiosInstance.get(`/api/drivers/user/${userId}`);
        return response.data.data;
    } catch (error) {
        throw formatError(error);
    }
};

/**
 * Update KYC information (driver side)
 * PUT /api/drivers/update/:id
 */
export const updateDriverKYC = async (id, data) => {
    try {
        const response = await axiosInstance.put(`/api/drivers/update/${id}`, data);
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
        return response.data.data;
    } catch (error) {
        throw formatError(error);
    }
};

/**
 * Delete a KYC record (admin side)
 * DELETE /api/drivers/delete/:id
 */
export const deleteDriverKYC = async (id) => {
    try {
        const response = await axiosInstance.delete(`/api/drivers/delete/${id}`);
        return response.data;
    } catch (error) {
        throw formatError(error);
    }
};
