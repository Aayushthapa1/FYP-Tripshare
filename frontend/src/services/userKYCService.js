import axios from "axios";
import { Base_Backend_Url } from "../../constant";
import formatError from "../utils/errorUtils";
import axiosInstance from "../utils/axiosInstance";

// 1) Submit User KYC
const submitUserKYC = async (formData) => {
    try {
        const userId = formData.get("userId");
        if (!userId) {
            throw new Error("User ID is required for KYC submission");
        }

        // Log some form data for debugging
        console.log("submitUserKYC formData content:");
        for (const pair of formData.entries()) {
            if (["citizenshipFront", "citizenshipBack", "photo"].includes(pair[0])) {
                console.log(`${pair[0]}: [File object]`);
            } else {
                console.log(`${pair[0]}: ${pair[1]}`);
            }
        }

        // We use axios directly here, but you can also call axiosInstance
        const response = await axios.post(
            `${Base_Backend_Url}/api/userkyc/kyc/${userId}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            }
        );

        return response.data; // { success, message, user: {...} }
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// 2) Get User KYC Status
const getUserKYCStatus = async (userId) => {
    try {
        const response = await axiosInstance.get(`/api/userkyc/kyc/status/${userId}`);
        // e.g. { success: true, kycStatus, kycRejectionReason, user }
        return response.data;
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// 3) Get ALL Users with KYC
const getAllUsersKYC = async () => {
    try {
        const response = await axiosInstance.get(`${Base_Backend_Url}/api/userkyc/all`);
        return response.data; // { success: true, users: [...] }
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// 4) Get PENDING KYC
const getPendingUserKYC = async () => {
    try {
        const response = await axiosInstance.get(`${Base_Backend_Url}/api/userkyc/pending`);
        return response.data; // { success: true, users: [...] }
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// 5) Update KYC Verification (Admin)
const updateUserKYCVerification = async (userId, status, rejectionReason = null) => {
    try {
        const response = await axiosInstance.put(
            `${Base_Backend_Url}/api/userkyc/kyc/verify/${userId}`,
            { status, rejectionReason }
        );
        // { success, message, user: {...} }
        return response.data;
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// 6) Get VERIFIED KYC
const getVerifiedUserKYC = async () => {
    try {
        const response = await axiosInstance.get(`${Base_Backend_Url}/api/userkyc/verified`);
        return response.data; // { success: true, users: [...] }
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

const userKYCService = {
    submitUserKYC,
    getUserKYCStatus,
    getAllUsersKYC,
    getPendingUserKYC,
    updateUserKYCVerification,
    getVerifiedUserKYC,
};

export default userKYCService;
