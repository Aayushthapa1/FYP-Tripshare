import axios from "axios";
import { Base_Backend_Url } from "../../constant";
import formatError from "../utils/errorUtils";
import axiosInstance from "../utils/axiosInstance";

// 1) Submit Driver KYC
const submitDriverKYC = async (formData) => {
    try {
        const userId = formData.get("userId");
        if (!userId) {
            throw new Error("User ID is required for driver KYC submission");
        }

        // Log some form data for debugging
        console.log("submitDriverKYC formData content:");
        for (const pair of formData.entries()) {
            if (["citizenshipFront", "citizenshipBack", "licenseFront", "licenseBack", "vehiclePhoto"].includes(pair[0])) {
                console.log(`${pair[0]}: [File object]`);
            } else {
                console.log(`${pair[0]}: ${pair[1]}`);
            }
        }

        // We use axios directly here, but you can also call axiosInstance
        const response = await axios.post(
            `${Base_Backend_Url}/api/drivers/submitkycdriver/${userId}`,
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

// 2) Get Driver KYC Status
const getDriverKYCStatus = async (userId) => {
    try {
        const response = await axios.get(`${Base_Backend_Url}/api/drivers/getdriverkycstatus/${userId}`);
        // e.g. { success: true, kycStatus, kycRejectionReason, user }
        return response.data;
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// 3) Get ALL Drivers with KYC
const getAllDriversKYC = async () => {
    try {
        const response = await axios.get(`${Base_Backend_Url}/api/drivers/getalldriverkyc`);
        return response.data.drivers; // { success: true, drivers: [...] }
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// 4) Get PENDING KYC
const getPendingDriverKYC = async () => {
    try {
        const response = await axios.get(`${Base_Backend_Url}/api/drivers/getpendingdriverkyc`);
        console.log("Pending KYC response:", response);
        return response.data; // { success: true, drivers: [...] }
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

// 5) Update KYC Verification (Admin)
const updateDriverKYCVerification = async (userId, status, rejectionReason = null) => {
    try {
        const response = await axios.put(
            `${Base_Backend_Url}/api/drivers/kycverifydriver/${userId}`,
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
const getVerifiedDriverKYC = async () => {
    try {
        const response = await axios.get(`${Base_Backend_Url}/api/drivers/getverifieddriverkyc`);
        return response.data; // { success: true, drivers: [...] }
    } catch (error) {
        const formattedError = formatError(error);
        throw formattedError;
    }
};

const driverKYCService = {
    submitDriverKYC,
    getDriverKYCStatus,
    getAllDriversKYC,
    getPendingDriverKYC,
    updateDriverKYCVerification,
    getVerifiedDriverKYC,
};

export default driverKYCService;