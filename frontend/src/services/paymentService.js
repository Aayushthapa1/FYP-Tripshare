import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";

// Initiate payment (maps to initiatePayment controller)
export const initiatePayment = createAsyncThunk(
  "payment/initiate",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/payments/initiate", paymentData);

      if (!response.data.success) {
        return rejectWithValue({
          message: response.data.message || "Payment initiation failed",
          errors: response.data.errors || []
        });
      }

      return response.data.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to initiate payment",
        errors: error.response?.data?.errors || []
      });
    }
  }
);

// Check Khalti payment status after redirect (maps to completeKhaltiPayment controller)
export const checkKhaltiPaymentStatus = createAsyncThunk(
  "payment/checkKhaltiStatus",
  async (queryParams, { rejectWithValue }) => {
    try {
      // Build query string from params
      const params = new URLSearchParams(queryParams).toString();
      const response = await axiosInstance.get(`/payments/completeKhaltiPayment?${params}`);

      // This is a redirect endpoint, so we might not get a direct response
      // But we can check the payment status afterward
      return { redirected: true };
    } catch (error) {
      return rejectWithValue({
        message: "Failed to complete Khalti payment",
        errors: [error.message]
      });
    }
  }
);

// Get payment details (maps to getPaymentDetails controller)
export const getPaymentDetails = createAsyncThunk(
  "payment/getDetails",
  async (paymentId, { rejectWithValue }) => {
    try {
      // Updated to match the backend route
      const response = await axiosInstance.get(`/payments/details/${paymentId}`);

      if (!response.data.success) {
        return rejectWithValue({
          message: response.data.message || "Failed to get payment details",
          errors: response.data.errors || []
        });
      }

      return response.data.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to get payment details",
        errors: error.response?.data?.errors || []
      });
    }
  }
);

// Get all payments (maps to getAllPayments controller)
export const getAllPayments = createAsyncThunk(
  "payment/getAll",
  async (filters = {}, { rejectWithValue }) => {
    try {
      // Convert filters object to query string
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const queryString = queryParams.toString();
      // Updated to match the backend route
      const url = queryString ? `/payments/all?${queryString}` : "/payments/all";

      const response = await axiosInstance.get(url);

      if (!response.data.success) {
        return rejectWithValue({
          message: response.data.message || "Failed to get payments",
          errors: response.data.errors || []
        });
      }

      return response.data.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to get payments",
        errors: error.response?.data?.errors || []
      });
    }
  }
);

// Helper function to handle Khalti redirect
export const handleKhaltiRedirect = (paymentUrl) => {
  if (paymentUrl) {
    window.location.href = paymentUrl;
    return true;
  }
  return false;
};

// Helper function to extract Khalti callback parameters from URL
export const extractKhaltiCallbackParams = () => {
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

// New function to check payment status by booking ID
export const getPaymentStatusByBooking = createAsyncThunk(
  "payment/getStatusByBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/payments/booking/${bookingId}`);
      
      if (!response.data.success) {
        return rejectWithValue({
          message: response.data.message || "Failed to get payment status",
          errors: response.data.errors || []
        });
      }
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to get payment status",
        errors: error.response?.data?.errors || []
      });
    }
  }
);