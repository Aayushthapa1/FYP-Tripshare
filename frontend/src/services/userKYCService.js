import axios from "axios"
import { Base_Backend_Url } from "../../constant"
import formatError from "../utils/errorUtils"
import axiosInstance from "../utils/axiosInstance"

// 1) **Submit User KYC (Personal Info Only)**
const submitUserKYC = async (formData) => {
    try {
        // Check if userId exists in the FormData
        const userId = formData.get("userId")
        if (!userId) {
            console.error("submitUserKYC: No userId found in FormData")
            throw new Error("User ID is required for KYC submission")
        }

        console.log("submitUserKYC: Processing request with userId:", userId)

        // Log the FormData contents for debugging
        console.log("User KYC FormData contents:")
        for (const pair of formData.entries()) {
            if (pair[0] === "citizenshipFront" || pair[0] === "citizenshipBack" || pair[0] === "photo") {
                console.log(`${pair[0]}: [File object]`)
            } else {
                console.log(`${pair[0]}: ${pair[1]}`)
            }
        }

        // Important: Do not create a new FormData object, use the one passed in
        // This ensures the file objects remain intact
        const response = await axios.post(`${Base_Backend_Url}/api/userkyc/kyc/${userId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
        })

        console.log("User KYC submitted successfully:", response.data)
        return response.data
    } catch (error) {
        console.error("Error submitting user KYC:", error.response?.data || error.message)
        const formattedError = formatError(error)
        console.log("Formatted error in submitUserKYC:", formattedError)
        throw formattedError
    }
}
// 2) **Get User KYC Status**
const getUserKYCStatus = async (userId) => {
    try {
        console.log(`Getting KYC status for user ${userId}`);
        const response = await axiosInstance.get(`${Base_Backend_Url}/api/userkyc/kyc/status/${userId}`);
        console.log("User KYC status fetched successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error(`Error getting KYC status for user ${userId}:`, error.response?.data || error.message);
        const formattedError = formatError(error);
        console.log("Formatted error in getUserKYCStatus:", formattedError);
        throw formattedError;
    }
};

const getPendingUserKYC = async () => {
    try {
        console.log("Fetching pending user KYC requests");
        const response = await axiosInstance.get(`${Base_Backend_Url}/api/userkyc/pending`);
        console.log("Fetched pending user KYC requests successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching pending user KYC requests:", error.response?.data || error.message);
        const formattedError = formatError(error);
        console.log("Formatted error in getPendingUserKYC:", formattedError);
        throw formattedError;
    }
};

// -- New function: GET all users with any KYC status
const getAllUsersKYC = async () => {
    try {
        console.log("Fetching all users with KYC");
        const response = await axiosInstance.get(`${Base_Backend_Url}/api/userkyc/all`);
        console.log("Fetched users with KYC successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching users with KYC:", error.response?.data || error.message);
        const formattedError = formatError(error);
        console.log("Formatted error in getAllUsersKYC:", formattedError);
        throw formattedError;
    }
};
// 5) **Update User KYC Verification (Admin)**
const updateUserKYCVerification = async (userId, status, rejectionReason = null) => {
    try {
        console.log(`Updating user ${userId} KYC verification status to ${status}`);
        const response = await axiosInstance.put(`${Base_Backend_Url}/api/userkyc/kyc/verify/${userId}`, {
            status,
            rejectionReason,
        });
        console.log("User KYC verification updated successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error(`Error updating verification for user ${userId}:`, error.response?.data || error.message);
        const formattedError = formatError(error);
        console.log("Formatted error in updateUserKYCVerification:", formattedError);
        throw formattedError;
    }
};

// 6) Get Verified User KYC
const getVerifiedUserKYC = async () => {
    try {
      console.log("Fetching verified user KYC requests");
      const response = await axiosInstance.get(`${Base_Backend_Url}/api/userkyc/verified`);
      console.log("Fetched verified user KYC successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching verified user KYC:", error.response?.data || error.message);
      const formattedError = formatError(error);
      console.log("Formatted error in getVerifiedUserKYC:", formattedError);
      throw formattedError;
    }
  };

// Exporting all service functions
const userKYCService = {
    submitUserKYC,
    getUserKYCStatus,
    getAllUsersKYC,
    getPendingUserKYC,
    updateUserKYCVerification,
    getVerifiedUserKYC,
}

export default userKYCService
