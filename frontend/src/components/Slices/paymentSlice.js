
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";


// Renamed thunk to match your component's expected name
export const initiatePayment = createAsyncThunk(
    "payment/initiate",
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/api/payments/initiate", paymentData);
            console.log("The response is", response)


            if (!response.data.IsSuccess) {
                return rejectWithValue({
                    message: response.data.message || "Payment initiation failed",
                    errors: response.data.errors || []
                });
            }


            return response?.data
        } catch (error) {
            conaole.log("The error is", error)
            return rejectWithValue({
                message: error.response?.data?.message || "Failed to initiate payment",
                errors: error.response?.data?.errors || []
            });
        }
    }
);


// Get payment details
export const getPaymentDetails = createAsyncThunk(
    "payment/getDetails",
    async (paymentId, { rejectWithValue }) => {
        try {
            // Updated endpoint to match your backend route
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


// Get all payments
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
            // Updated endpoint to match your backend route
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


const initialState = {
    // Payment data
    payments: [],
    currentPayment: null,
    paymentUrl: null,


    // UI states
    loading: false,


    // Error handling
    error: null,
    errorDetails: [],


    // Success states
    success: false,
    successMessage: ""
};


const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        clearPaymentState: (state) => {
            state.error = null;
            state.errorDetails = [];
            state.success = false;
            state.successMessage = "";
            state.paymentUrl = null;
        },


        resetPaymentState: (state) => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        builder
            // Initiate Payment
            .addCase(initiatePayment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorDetails = [];
                state.success = false;
            })
            .addCase(initiatePayment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.successMessage = "Payment initiated successfully";
                state.currentPayment = action.payload.payment;


                // If Khalti or eSewa payment, store the payment URL
                if (action.payload.payment_url) {
                    state.paymentUrl = action.payload.payment_url;
                }
            })
            .addCase(initiatePayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Payment initiation failed";
                state.errorDetails = action.payload?.errors || [];
            })


            // Get Payment Details
            .addCase(getPaymentDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorDetails = [];
            })
            .addCase(getPaymentDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPayment = action.payload.payment; // Access payment from the payload

                // Set success based on payment status
                if (state.currentPayment && state.currentPayment.status === "completed") {
                    state.success = true;
                    state.successMessage = "Payment completed successfully";
                }
            })
            .addCase(getPaymentDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to get payment details";
                state.errorDetails = action.payload?.errors || [];
            })


            // Get All Payments
            .addCase(getAllPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorDetails = [];
            })
            .addCase(getAllPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = action.payload.payments || [];
            })
            .addCase(getAllPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to get payments";
                state.errorDetails = action.payload?.errors || [];
            });
    },
});


export const { clearPaymentState, resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
