
import axiosInstance from "../utils/axiosInstance";

// 1) **Save Personal Info**
const savePersonalInfo = async (formData) => {
    try {
        const response = await axiosInstance.post(`/api/personalinfo`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data; // Typically { message, driver } or just driver object
    } catch (error) {
        console.error("Error saving personal info:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to save personal information.");
    }
};

// 2) **Save License Info**
const saveLicenseInfo = async (driverId, formData) => {
    try {
        const response = await axiosInstance.post(`/api/licenseinfo`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        console.error("Error saving license info:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to save license information.");
    }
};

// 3) **Save Vehicle Info**
const saveVehicleInfo = async (driverId, formData) => {
    try {
        const response = await axiosInstance.post(`/api/vehicleinfo`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        console.error("Error saving vehicle info:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to save vehicle information.");
    }
};

// 4) **Fetch All Drivers**
const getAllDrivers = async () => {
    try {
        const response = await axiosInstance.get(`/api/drivers`);
        return response.data; // Should return an array of drivers
    } catch (error) {
        console.error("Error fetching drivers:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to fetch drivers.");
    }
};

// 5) **Fetch Driver by ID**
const getDriverById = async (driverId) => {
    try {
        const response = await axiosInstance.get(`/api/drivers/${driverId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching driver ${driverId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to fetch driver details.");
    }
};

// 6) **Update Verification (Verify or Reject a Driver)**
const updateDriverVerification = async (driverId, status, rejectionReason = null) => {
    try {
        // The endpoint should match what's defined in your backend routes
        const response = await axiosInstance.put(`/api/drivers/verify/${driverId}`, { status, rejectionReason });
        return response.data;
    } catch (error) {
        console.error(
            `Error in updateDriverVerification for driver ${driverId}:`,
            error.response?.data || error.message
        );
        throw new Error(error.response?.data?.message || "Failed to update driver verification status.");
    }
};

// 7) **Submit KYC**
const submitKYC = async (userId, kycData) => {
    try {
        const response = await axiosInstance.post(`/api/kyc`, { userId, ...kycData });
        return response.data;
    } catch (error) {
        console.error("Error submitting KYC:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to submit KYC.");
    }
};

// 8) **Fetch Pending KYC Requests**
const getPendingKYC = async () => {
    try {
        const response = await axiosInstance.get(`/api/drivers/kycpending`);
        return response.data; // Should return an array of pending KYC requests
    } catch (error) {
        console.error("Error fetching pending KYC requests:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to fetch pending KYC requests.");
    }
};

// 9) **Reject a Driver**
const rejectDriver = async (driverId, reason) => {
    try {
        const response = await axiosInstance.put(`/api/drivers/${driverId}/verify`, {
            status: "rejected",
            rejectionReason: reason,
        });
        return response.data;
    } catch (error) {
        console.error(`Error rejecting driver ${driverId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to reject driver.");
    }
};

// 10) **Verify a Driver**
const verifyDriver = async (driverId) => {
    try {
        const response = await axiosInstance.put(`/api/drivers/${driverId}/verify`, {
            status: "verified",
        });
        return response.data;
    } catch (error) {
        console.error(`Error verifying driver ${driverId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to verify driver.");
    }
};

// Exporting all service functions
const driverService = {
    savePersonalInfo,
    saveLicenseInfo,
    saveVehicleInfo,
    getAllDrivers,
    getDriverById,
    updateDriverVerification,
    submitKYC,
    getPendingKYC,
    rejectDriver,
    verifyDriver,
};

export default driverService;
