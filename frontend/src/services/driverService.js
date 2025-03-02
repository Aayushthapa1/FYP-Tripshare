import axios from 'axios';

const API_URL = '/api/drivers';

const savePersonalInfo = async (formData) => {
    const response = await axios.post(`${API_URL}/personalinfo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

const saveLicenseInfo = async (driverId, formData) => {
    const response = await axios.post(`${API_URL}/licenseinfo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

const saveVehicleInfo = async (driverId, formData) => {
    const response = await axios.post(`${API_URL}/vehicleinfo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

const getAllDrivers = async () => {
    const response = await axios.get(`${API_URL}/drivers`);
    return response.data;
};

const updateVerification = async (driverId, isVerified) => {
    const response = await axios.put(`${API_URL}/drivers/${driverId}/verify`, { isVerified });
    return response.data;
};

const submitKYC = async (userId, kycData) => {
    const response = await axios.post(`${API_URL}/kyc`, { userId, ...kycData });
    return response.data;
};
const getKYCData = async () => {
    const response = await axios.get(`${API_URL}/kyc`);
    return response.data;
};

export default {
    savePersonalInfo,
    saveLicenseInfo,
    saveVehicleInfo,
    getAllDrivers,
    updateVerification,
    submitKYC,
    getKYCData,
};