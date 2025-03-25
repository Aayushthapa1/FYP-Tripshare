import axios from "axios"
import { Base_Backend_Url } from "../../constant"
import formatError from "../utils/errorUtils"
import axiosInstance from "../utils/axiosInstance"

// 1) **Save Personal Info**
const savePersonalInfo = async (formData) => {
    try {
        // Check if userId exists in the FormData
        const userId = formData.get("userId")
        if (!userId) {
            console.error("savePersonalInfo: No userId found in FormData")
            throw new Error("User ID is required for KYC submission")
        }

        console.log("savePersonalInfo: Processing request with userId:", userId)

        // Log the FormData contents for debugging
        console.log("Personal Info FormData contents:")
        for (const pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`)
        }

        const response = await axios.post(`${Base_Backend_Url}/api/drivers/personalinfo`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
        })

        console.log("Personal info saved successfully:", response.data)
        return response.data
    } catch (error) {
        console.error("Error saving personal info:", error.response?.data || error.message)
        const formattedError = formatError(error)
        console.log("Formatted error in savePersonalInfo:", formattedError)
        throw formattedError
    }
}

// 2) **Save License Info**
const saveLicenseInfo = async (driverId, formData) => {
    try {
        // Log the FormData contents for debugging
        console.log("License Info FormData contents:")
        for (const pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`)
        }

        const response = await axiosInstance.post(`${Base_Backend_Url}/api/drivers/licenseinfo`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
        })

        console.log("License info saved successfully:", response.data)
        return response.data
    } catch (error) {
        console.error("Error saving license info:", error.response?.data || error.message)
        const formattedError = formatError(error)
        console.log("Formatted error in saveLicenseInfo:", formattedError)
        throw formattedError
    }
}

// 3) **Save Vehicle Info**
const saveVehicleInfo = async (driverId, formData) => {
    try {
        // Log the FormData contents for debugging
        console.log("Vehicle Info FormData contents:")
        for (const pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`)
        }

        const response = await axiosInstance.post(`${Base_Backend_Url}/api/drivers/vehicleinfo`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
        })

        console.log("Vehicle info saved successfully:", response.data)
        return response.data
    } catch (error) {
        console.error("Error saving vehicle info:", error.response?.data || error.message)
        const formattedError = formatError(error)
        console.log("Formatted error in saveVehicleInfo:", formattedError)
        throw formattedError
    }
}

// 4) **Submit Complete Driver KYC**
const submitDriverKYC = async (formData) => {
    try {
        // Log the FormData contents for debugging
        console.log("Driver KYC FormData contents:")
        for (const pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`)
        }

        const response = await axios.post(`${Base_Backend_Url}/api/drivers/kycdriver`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
        })

        console.log("Driver KYC submitted successfully:", response.data)
        return response.data
    } catch (error) {
        console.error("Error submitting driver KYC:", error.response?.data || error.message)
        const formattedError = formatError(error)
        console.log("Formatted error in submitDriverKYC:", formattedError)
        throw formattedError
    }
}

// 5) **Fetch All Drivers**
const getAllDrivers = async () => {
    try {
        console.log("Fetching all drivers")
        const response = await axiosInstance.get(`/api/drivers/drivers`)
        console.log("Fetched drivers successfully:", response.data)
        return response.data // Should return an array of drivers
    } catch (error) {
        console.error("Error fetching drivers:", error.response?.data || error.message)
        const formattedError = formatError(error)
        console.log("Formatted error in getAllDrivers:", formattedError)
        throw formattedError
    }
}

// 6) **Fetch Driver by ID**
const getDriverById = async (driverId) => {
    try {
        console.log(`Fetching driver with ID: ${driverId}`)
        const response = await axiosInstance.get(`/api/drivers/drivers/${driverId}`)
        console.log("Fetched driver successfully:", response.data)
        return response.data
    } catch (error) {
        console.error(`Error fetching driver ${driverId}:`, error.response?.data || error.message)
        const formattedError = formatError(error)
        console.log("Formatted error in getDriverById:", formattedError)
        throw formattedError
    }
}

// 7) **Fetch Pending Driver KYC Requests**
const getPendingDriverKYC = async () => {
    try {
        console.log("Fetching pending driver KYC requests")
        const response = await axiosInstance.get(`/api/admin/drivers/kyc/pending`)
        console.log("Fetched pending driver KYC requests successfully:", response.data)
        return response.data // Should return an array of pending KYC requests
    } catch (error) {
        console.error("Error fetching pending driver KYC requests:", error.response?.data || error.message)
        const formattedError = formatError(error)
        console.log("Formatted error in getPendingDriverKYC:", formattedError)
        throw formattedError
    }
}

// 8) **Update Driver KYC Verification**
const updateDriverKYCVerification = async (driverId, status, rejectionReason = null) => {
    try {
        console.log(`Updating driver ${driverId} KYC verification status to ${status}`)
        const response = await axiosInstance.put(`/api/admin/kyc/driver/${driverId}`, {
            status,
            rejectionReason,
        })
        console.log("Driver KYC verification updated successfully:", response.data)
        return response.data
    } catch (error) {
        console.error(`Error updating verification for driver ${driverId}:`, error.response?.data || error.message)
        const formattedError = formatError(error)
        console.log("Formatted error in updateDriverKYCVerification:", formattedError)
        throw formattedError
    }
}

// 9) **Get Driver KYC Status**
const getDriverKYCStatus = async (driverId) => {
    try {
        console.log(`Getting KYC status for driver ${driverId}`)
        const response = await axiosInstance.get(`/api/drivers/kyc/status/${driverId}`)
        console.log("Driver KYC status fetched successfully:", response.data)
        return response.data
    } catch (error) {
        console.error(`Error getting KYC status for driver ${driverId}:`, error.response?.data || error.message)
        const formattedError = formatError(error)
        console.log("Formatted error in getDriverKYCStatus:", formattedError)
        throw formattedError
    }
}

// Exporting all service functions
const driverKYCService = {
    savePersonalInfo,
    saveLicenseInfo,
    saveVehicleInfo,
    submitDriverKYC,
    getAllDrivers,
    getDriverById,
    getPendingDriverKYC,
    updateDriverKYCVerification,
    getDriverKYCStatus,
}

export default driverKYCService

