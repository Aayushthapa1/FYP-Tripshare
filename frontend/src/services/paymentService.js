// paymentService.js

import axios from "axios";
import { Base_Backend_Url } from "../../constant";
import formatError from "../utils/errorUtils";
import axiosInstance from "../utils/axiosInstance";

/**
 * Initiate a payment
 * POST /api/payments/initiate
 */
const initiatePayment = async (paymentData) => {
  try {
    console.log("Initiating payment with data:", paymentData);

    const response = await axiosInstance.post(
      `${Base_Backend_Url}/api/payments/initiate`,
      paymentData,
      {
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("initiatePayment error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * Get payment details by ID
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
 * Get all payments (admin only)
 * GET /api/payments/admin/all
 */
const getAllPayments = async (filters = {}) => {
  try {
    console.log("Fetching all payments with filters:", filters);

    // Convert filters object to query string
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
 * Get user payments
 * GET /api/payments/user
 */
const getUserPayments = async (filters = {}) => {
  try {
    console.log("Fetching user payments with filters:", filters);

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
 * Get driver payments
 * GET /api/payments/driver
 */
const getDriverPayments = async (filters = {}) => {
  try {
    console.log("Fetching driver payments with filters:", filters);

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
 * Get admin payment stats
 * GET /api/payments/admin/stats
 */
const getAdminPaymentStats = async (filters = {}) => {
  try {
    console.log("Fetching admin payment stats with filters:", filters);

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
 * Complete Khalti payment after redirect
 * GET /api/payments/completeKhaltiPayment
 */
const completeKhaltiPayment = async (queryParams) => {
  try {
    console.log("Completing Khalti payment with params:", queryParams);

    const params = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(
      `${Base_Backend_Url}/api/payments/completeKhaltiPayment?${params}`,
      { withCredentials: true }
    );

    return response.data;
  } catch (error) {
    console.error("completeKhaltiPayment error:", error);
    const formattedError = formatError(error);
    throw formattedError;
  }
};

/**
 * Extract Khalti callback parameters from URL
 */
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

/**
 * Handle Khalti redirect
 */
const handleKhaltiRedirect = (paymentUrl) => {
  if (paymentUrl) {
    window.location.href = paymentUrl;
    return true;
  }
  return false;
};

/**
 * Get payment status by booking ID
 * GET /api/payments/booking/:bookingId
 */
const getPaymentStatusByBooking = async (bookingId) => {
  try {
    console.log("Fetching payment status for booking ID:", bookingId);

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

// Combine them into a single object for easy import
const paymentService = {
  initiatePayment,
  getPaymentDetails,
  getAllPayments,
  getUserPayments,
  getDriverPayments,
  getAdminPaymentStats,
  completeKhaltiPayment,
  extractKhaltiCallbackParams,
  handleKhaltiRedirect,
  getPaymentStatusByBooking
};

export default paymentService;