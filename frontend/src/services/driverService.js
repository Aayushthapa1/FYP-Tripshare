import axios from 'axios';


const savePersonalInfo = async (formData) => {
    try {
        const response = await axiosInstance.post(`/api/personalinfo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving personal info:', error);
        throw new Error(error.response?.data?.message || 'Failed to save personal information');
    }
};


const saveLicenseInfo = async (driverId, formData) => {
    try {
        const response = await axiosInstance.post(`/api/licenseinfo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving license info:', error);
        throw new Error(error.response?.data?.message || 'Failed to save license information');
    }
};


const saveVehicleInfo = async (driverId, formData) => {
    try {
        const response = await axiosInstance.post(`/api/vehicleinfo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Error saving vehicle info:', error);
        throw new Error(error.response?.data?.message || 'Failed to save vehicle information');
    }
};


const getAllDrivers = async () => {
    try {
        const response = await axiosInstance.get(`/api/drivers`);
        return response.data;
    } catch (error) {
        console.error('Error fetching drivers:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch drivers');
    }
};


const updateVerification = async (driverId, isVerified) => {
    try {
        const response = await axiosInstance.put(`/api/drivers/${driverId}/verify`, { isVerified });
        return response.data;
    } catch (error) {
        console.error('Error updating verification status:', error);
        throw new Error(error.response?.data?.message || 'Failed to update verification status');
    }
};


const submitKYC = async (userId, kycData) => {
    try {
        const response = await axiosInstance.post(`/api/kyc`, { userId, ...kycData });
        return response.data;
    } catch (error) {
        console.error('Error submitting KYC:', error);
        throw new Error(error.response?.data?.message || 'Failed to submit KYC');
    }
};


const getPendingKYC = async () => {
    try {
        const response = await axiosInstance.get(`/api/drivers/kycpending`);
        console.log('Pending KYC response:', response);
        return response.data;
    } catch (error) {
        console.error('Error fetching pending KYC:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch pending KYC');
    }
};

export default {
    savePersonalInfo,
    saveLicenseInfo,
    saveVehicleInfo,
    getAllDrivers,
    updateVerification,
    submitKYC,
    getPendingKYC,
};