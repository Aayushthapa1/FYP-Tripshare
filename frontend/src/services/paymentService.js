// paymentService.js
import axiosInstance from "../utils/axiosInstance";
import formatError from "../utils/errorUtils";
import { Base_Backend_Url } from "../../constant";

/**
 * INITIATE a payment (with Khalti)
 * POST /api/payments/initiate
 */
const initiatePayment = async (paymentData) => {
  try {
    console.log("Initiating payment with data:", paymentData);

    const response = await axiosInstance.post(
      `${Base_Backend_Url}/api/payments/initiate`,
      paymentData,
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    console.error("initiatePayment error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * GET payment details by ID
 * GET /api/payments/:paymentId
 */
const getPaymentDetails = async (paymentId) => {
  try {
    console.log("Fetching payment details for ID:", paymentId);

    const response = await axiosInstance.get(
      `${Base_Backend_Url}/api/payments/${paymentId}`,
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    console.error("getPaymentDetails error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * CHECK payment status by booking ID
 * GET /api/payments/booking/:bookingId
 */
const getPaymentStatusByBooking = async (bookingId) => {
  try {
    console.log("Checking payment status for booking ID:", bookingId);

    const response = await axiosInstance.get(
      `${Base_Backend_Url}/api/payments/booking/${bookingId}`,
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    console.error("getPaymentStatusByBooking error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * GET all user payments
 * GET /api/payments/user
 */
const getUserPayments = async (filters = {}) => {
  try {
    console.log("Fetching user payments with filters:", filters);

    // Convert filters to query string
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${Base_Backend_Url}/api/payments/user?${queryString}`
      : `${Base_Backend_Url}/api/payments/user`;

    const response = await axiosInstance.get(url, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("getUserPayments error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * GET driver payments
 * GET /api/payments/driver
 */
const getDriverPayments = async (filters = {}) => {
  try {
    console.log("Fetching driver payments with filters:", filters);

    // Convert filters to query string
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${Base_Backend_Url}/api/payments/driver?${queryString}`
      : `${Base_Backend_Url}/api/payments/driver`;

    const response = await axiosInstance.get(url, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("getDriverPayments error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * GET all payments (Admin only)
 * GET /api/payments/admin/all
 */
const getAllPayments = async (filters = {}) => {
  try {
    console.log("Fetching all payments with filters (admin):", filters);

    // Convert filters to query string
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${Base_Backend_Url}/api/payments/admin/all?${queryString}`
      : `${Base_Backend_Url}/api/payments/admin/all`;

    const response = await axiosInstance.get(url, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("getAllPayments error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * GET admin payment stats
 * GET /api/payments/admin/stats
 */
const getAdminPaymentStats = async (filters = {}) => {
  try {
    console.log("Fetching admin payment stats with filters:", filters);

    // Convert filters to query string
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${Base_Backend_Url}/api/payments/admin/stats?${queryString}`
      : `${Base_Backend_Url}/api/payments/admin/stats`;

    const response = await axiosInstance.get(url, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("getAdminPaymentStats error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * VALIDATE Khalti payment after redirect
 * This simulates checking the callback parameters
 */
const checkKhaltiPaymentStatus = async (queryParams) => {
  try {
    console.log("Checking Khalti payment status with params:", queryParams);

    // Convert params to query string
    const params = new URLSearchParams(queryParams).toString();

    // This is a simulation since the actual endpoint redirects to frontend
    // In a real scenario, we'd check the payment status separately after redirect
    const response = await axiosInstance.get(
      `${Base_Backend_Url}/api/payments/check-status?${params}`,
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    console.error("checkKhaltiPaymentStatus error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

// Helper functions
const handleKhaltiRedirect = (paymentUrl) => {
  if (paymentUrl) {
    window.location.href = paymentUrl;
    return true;
  }
  return false;
};

const extractKhaltiCallbackParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pidx = urlParams.get('pidx');
  const transaction_id = urlParams.get('transaction_id');
  const amount = urlParams.get('amount');
  const purchase_order_id = urlParams.get('purchase_order_id');
  const status = urlParams.get('status');

  return {
    pidx,
    transaction_id,
    amount,
    purchase_order_id,
    status
  };
};

// Combine all methods into a single service object
const paymentService = {
  initiatePayment,
  getPaymentDetails,
  getPaymentStatusByBooking,
  getUserPayments,
  getDriverPayments,
  getAllPayments,
  getAdminPaymentStats,
  checkKhaltiPaymentStatus,
  handleKhaltiRedirect,
  extractKhaltiCallbackParams
};

export default paymentService;