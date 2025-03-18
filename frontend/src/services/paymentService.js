import axiosInstance from "../utils/axiosInstance";

// Utility functions for response handling
const handleResponse = (response) => {
  if (!response.data) {
    throw new Error("No data received from the server");
  }
  return response.data;
};

const handleError = (error) => {
  if (error.response) {
    throw new Error(
      error.response.data?.ErrorMessage?.[0]?.message ||
      error.response.data?.message ||
      "Unknown error"
    );
  } else if (error.request) {
    throw new Error("No response from server");
  } else {
    throw new Error(error.message);
  }
};

/**
 * 1️⃣ Create a payment
 * POST /api/payments
 */
export const createPayment = async ({ bookingId, amount, paymentMethod, transactionId, khaltiToken }) => {
  try {
    const response = await axiosInstance.post("/api/payments", {
      bookingId,
      amount,
      paymentMethod,
      transactionId,
      khaltiToken,
    });
    return handleResponse(response).Result?.payment;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * 2️⃣ Get payment details
 * GET /api/payments/:paymentId
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    const response = await axiosInstance.get(`/api/payments/${paymentId}`);
    return handleResponse(response).Result?.payment;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * 3️⃣ Get all payments for the logged-in user
 * GET /api/payments
 */
export const getAllPayments = async () => {
  try {
    const response = await axiosInstance.get("/api/payments");
    return handleResponse(response).Result?.payments || [];
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * 4️⃣ Verify eSewa Payment
 * POST /api/payments/verify-esewa
 */
export const verifyEsewaPayment = async ({ amount, transactionId }) => {
  try {
    const response = await axiosInstance.post("/api/payments/verify-esewa", { amount, transactionId });
    return handleResponse(response);
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * 5️⃣ Verify Khalti Payment
 * POST /api/payments/verify-khalti
 */
export const verifyKhaltiPayment = async ({ khaltiToken, amount }) => {
  try {
    const response = await axiosInstance.post("/api/payments/verify-khalti", { khaltiToken, amount });
    return handleResponse(response);
  } catch (error) {
    throw handleError(error);
  }
};

const paymentService = {
  createPayment,
  getPaymentDetails,
  getAllPayments,
  verifyEsewaPayment,
  verifyKhaltiPayment,
};

export default paymentService;
