import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import paymentService from "../../services/paymentService";

// 1) Initiate payment
export const initiatePayment = createAsyncThunk(
    "payment/initiate",
    async (paymentData, { rejectWithValue }) => {
        try {
            return await paymentService.initiatePayment(paymentData);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// 2) Get payment details
export const getPaymentDetails = createAsyncThunk(
    "payment/getDetails",
    async (paymentId, { rejectWithValue }) => {
        try {
            return await paymentService.getPaymentDetails(paymentId);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// 3) Get all payments (admin)
export const getAllPayments = createAsyncThunk(
    "payment/getAll",
    async (filters = {}, { rejectWithValue }) => {
        try {
            return await paymentService.getAllPayments(filters);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// 4) Get user payments
export const getUserPayments = createAsyncThunk(
    "payment/getUserPayments",
    async (filters = {}, { rejectWithValue }) => {
        try {
            return await paymentService.getUserPayments(filters);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// 5) Get driver payments
export const getDriverPayments = createAsyncThunk(
    "payment/getDriverPayments",
    async (filters = {}, { rejectWithValue }) => {
        try {
            return await paymentService.getDriverPayments(filters);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// 6) Get admin payment stats
export const getAdminPaymentStats = createAsyncThunk(
    "payment/getAdminStats",
    async (filters = {}, { rejectWithValue }) => {
        try {
            return await paymentService.getAdminPaymentStats(filters);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// 7) Complete Khalti payment
export const completeKhaltiPayment = createAsyncThunk(
    "payment/completeKhalti",
    async (queryParams, { rejectWithValue }) => {
        try {
            return await paymentService.completeKhaltiPayment(queryParams);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// 8) Get payment status by booking ID
export const getPaymentStatusByBooking = createAsyncThunk(
    "payment/getStatusByBooking",
    async (bookingId, { rejectWithValue }) => {
        try {
            return await paymentService.getPaymentStatusByBooking(bookingId);
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const paymentSlice = createSlice({
    name: "payment",
    initialState: {
        // Payment data
        payments: [],
        currentPayment: null,
        paymentUrl: null,
        userPayments: [],
        driverPayments: [],
        adminStats: null,
        recentPayments: [],
        userPaymentStats: null,
        driverPaymentStats: null,

        // UI states
        loading: false,
        statsLoading: false,

        // Error handling
        error: null,
        errorDetails: [],

        // Success states
        success: false,
        successMessage: "",

        // Track last action
        lastAction: null,
    },
    reducers: {
        clearPaymentState: (state) => {
            state.error = null;
            state.errorDetails = [];
            state.success = false;
            state.successMessage = "";
            state.paymentUrl = null;
        },

        resetPaymentState: (state) => {
            return {
                ...state,
                loading: false,
                error: null,
                errorDetails: [],
                success: false,
                successMessage: "",
                paymentUrl: null,
                currentPayment: null,
                lastAction: null
            };
        }
    },
    extraReducers: (builder) => {
        builder
            // INITIATE PAYMENT
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
                state.currentPayment = action.payload?.data?.payment || action.payload?.payment;

                // If Khalti or eSewa payment, store the payment URL
                if (action.payload?.data?.payment_url || action.payload?.payment_url) {
                    state.paymentUrl = action.payload?.data?.payment_url || action.payload?.payment_url;
                }

                state.lastAction = Date.now();
            })
            .addCase(initiatePayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.errorDetails = action.payload?.errors || [];
            })

            // GET PAYMENT DETAILS
            .addCase(getPaymentDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorDetails = [];
            })
            .addCase(getPaymentDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPayment = action.payload?.data?.payment || action.payload?.payment;

                // Set success based on payment status
                if (state.currentPayment && state.currentPayment.status === "completed") {
                    state.success = true;
                    state.successMessage = "Payment completed successfully";
                }
            })
            .addCase(getPaymentDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.errorDetails = action.payload?.errors || [];
            })

            // GET ALL PAYMENTS (ADMIN)
            .addCase(getAllPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorDetails = [];
            })
            .addCase(getAllPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = action.payload?.data?.payments || action.payload?.payments || [];
            })
            .addCase(getAllPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.errorDetails = action.payload?.errors || [];
            })

            // GET USER PAYMENTS
            .addCase(getUserPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorDetails = [];
            })
            .addCase(getUserPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.userPayments = action.payload?.data?.payments || action.payload?.payments || [];
                state.userPaymentStats = action.payload?.data?.stats || action.payload?.stats || null;
            })
            .addCase(getUserPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.errorDetails = action.payload?.errors || [];
            })

            // GET DRIVER PAYMENTS
            .addCase(getDriverPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorDetails = [];
            })
            .addCase(getDriverPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.driverPayments = action.payload?.data?.payments || action.payload?.payments || [];
                state.driverPaymentStats = action.payload?.data?.stats || action.payload?.stats || null;
            })
            .addCase(getDriverPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.errorDetails = action.payload?.errors || [];
            })

            // GET ADMIN PAYMENT STATS
            .addCase(getAdminPaymentStats.pending, (state) => {
                state.statsLoading = true;
                state.error = null;
                state.errorDetails = [];
            })
            .addCase(getAdminPaymentStats.fulfilled, (state, action) => {
                state.statsLoading = false;
                state.adminStats = action.payload?.data?.stats || action.payload?.stats || null;
                state.recentPayments = action.payload?.data?.recentPayments || action.payload?.recentPayments || [];
            })
            .addCase(getAdminPaymentStats.rejected, (state, action) => {
                state.statsLoading = false;
                state.error = action.payload;
                state.errorDetails = action.payload?.errors || [];
            })

            // COMPLETE KHALTI PAYMENT
            .addCase(completeKhaltiPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorDetails = [];
            })
            .addCase(completeKhaltiPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.successMessage = "Payment completed successfully";
                if (action.payload?.data?.payment) {
                    state.currentPayment = action.payload.data.payment;
                }
                state.lastAction = Date.now();
            })
            .addCase(completeKhaltiPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.errorDetails = action.payload?.errors || [];
            })

            // GET PAYMENT STATUS BY BOOKING
            .addCase(getPaymentStatusByBooking.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorDetails = [];
            })
            .addCase(getPaymentStatusByBooking.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload?.data?.payment) {
                    state.currentPayment = action.payload.data.payment;
                }
            })
            .addCase(getPaymentStatusByBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.errorDetails = action.payload?.errors || [];
            });
    },
});

export const { clearPaymentState, resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;