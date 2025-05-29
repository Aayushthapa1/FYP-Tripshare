// paymentSlice.js - Updated to correctly handle API response format
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import paymentService from "../../services/paymentService";

// Initiate payment (maps to initiatePayment controller)
export const initiatePayment = createAsyncThunk(
    "payment/initiate",
    async (paymentData, { rejectWithValue }) => {
        try {
            console.log("Initiating payment with data:", paymentData);

            // Validate required fields
            if (!paymentData.amount || paymentData.amount <= 0) {
                throw new Error("Valid payment amount is required");
            }

            if (!paymentData.bookingId && !paymentData.tripId) {
                throw new Error("Either bookingId or tripId must be provided");
            }

            if (paymentData.tripId && (!paymentData.seats || paymentData.seats < 1)) {
                throw new Error("Valid seat count is required for trip payments");
            }

            const result = await paymentService.initiatePayment(paymentData);
            console.log("Payment initiation result:", result);

            // Check if the response indicates success
            if (!result.IsSuccess && result.StatusCode !== 200) {
                return rejectWithValue({
                    message: result.ErrorMessage || "Payment initiation failed",
                    errors: result.ErrorMessage || []
                });
            }

            // Return the data from the response
            return result.Result
        } catch (error) {
            console.error("Payment initiation error:", error);
            return rejectWithValue({
                message: error.message || "Failed to initiate payment",
                errors: error.errors || []
            });
        }
    }
);

// Complete Khalti payment after redirect
export const completeKhaltiPayment = createAsyncThunk(
    "payment/completeKhalti",
    async (queryParams, { rejectWithValue }) => {
        try {
            console.log("Completing Khalti payment with params:", queryParams);

            // If no query params provided, extract from URL
            if (!queryParams) {
                queryParams = paymentService.extractKhaltiCallbackParams();
            }

            // Validate required params
            if (!queryParams.pidx) {
                throw new Error("Missing pidx parameter");
            }

            if (!queryParams.purchase_order_id) {
                throw new Error("Missing purchase_order_id parameter");
            }

            const result = await paymentService.completeKhaltiPayment(queryParams);
            console.log("Complete Khalti payment result:", result);

            // Note: This endpoint redirects in the backend, so we may not get a typical response
            // We'll handle the redirect in the UI based on the URL after redirect
            if (!result.IsSuccess && result.StatusCode !== 200) {
                return rejectWithValue({
                    message: result.ErrorMessage || "Failed to complete payment",
                    errors: result.ErrorMessage || []
                });
            }

            return result.Result || result.data || result;
        } catch (error) {
            console.error("Complete Khalti payment error:", error);
            return rejectWithValue({
                message: error.message || "Failed to complete payment",
                errors: error.errors || []
            });
        }
    }
);

// Check Khalti payment status after redirect
export const checkKhaltiPaymentStatus = createAsyncThunk(
    "payment/checkKhaltiStatus",
    async (queryParams, { rejectWithValue }) => {
        try {
            // If no query params provided, extract from URL
            if (!queryParams) {
                queryParams = paymentService.extractKhaltiCallbackParams();
            }

            // Validate required params
            if (!queryParams.pidx) {
                throw new Error("Missing pidx parameter");
            }

            const result = await paymentService.checkKhaltiPaymentStatus(queryParams);

            if (!result.IsSuccess && result.StatusCode !== 200) {
                return rejectWithValue({
                    message: result.ErrorMessage || "Failed to check payment status",
                    errors: result.ErrorMessage || []
                });
            }

            return result.Result || result.data || result;
        } catch (error) {
            console.error("Payment status check error:", error);
            return rejectWithValue({
                message: error.message || "Failed to check payment status",
                errors: error.errors || []
            });
        }
    }
);

// Get payment details by ID
export const getPaymentDetails = createAsyncThunk(
    "payment/getDetails",
    async (paymentId, { rejectWithValue }) => {
        try {
            console.log("Fetching payment details for ID:", paymentId);

            if (!paymentId) {
                throw new Error("Payment ID is required");
            }

            const result = await paymentService.getPaymentDetails(paymentId);
            console.log("Payment details result:", result);

            if (!result.IsSuccess && result.StatusCode !== 200) {
                return rejectWithValue({
                    message: result.ErrorMessage || "Failed to get payment details",
                    errors: result.ErrorMessage || []
                });
            }

            return result.Result || result.data || result;
        } catch (error) {
            console.error("Get payment details error:", error);
            return rejectWithValue({
                message: error.message || "Failed to get payment details",
                errors: error.errors || []
            });
        }
    }
);

// Get payment status by booking ID
export const getPaymentStatusByBooking = createAsyncThunk(
    "payment/getStatusByBooking",
    async (bookingId, { rejectWithValue }) => {
        try {
            console.log("Checking payment status for booking ID:", bookingId);

            if (!bookingId) {
                throw new Error("Booking ID is required");
            }

            const result = await paymentService.getPaymentStatusByBooking(bookingId);

            if (!result.IsSuccess && result.StatusCode !== 200) {
                return rejectWithValue({
                    message: result.ErrorMessage || "Failed to get payment status",
                    errors: result.ErrorMessage || []
                });
            }

            return result.Result || result.data || result;
        } catch (error) {
            console.error("Get payment status error:", error);
            return rejectWithValue({
                message: error.message || "Failed to get payment status",
                errors: error.errors || []
            });
        }
    }
);

// Get all payments (admin only)
export const getAllPayments = createAsyncThunk(
    "payment/getAll",
    async (filters = {}, { rejectWithValue }) => {
        try {
            console.log("Fetching all payments with filters:", filters);

            const result = await paymentService.getAllPayments(filters);
            console.log("Get all payments result:", result);

            if (!result.IsSuccess && result.StatusCode !== 200) {
                return rejectWithValue({
                    message: result.ErrorMessage || "Failed to get payments",
                    errors: result.ErrorMessage || []
                });
            }

            return result.Result || result.data || result;
        } catch (error) {
            console.error("Get all payments error:", error);
            return rejectWithValue({
                message: error.message || "Failed to get payments",
                errors: error.errors || []
            });
        }
    }
);

// Get user payments
export const getUserPayments = createAsyncThunk(
    "payment/getUserPayments",
    async (filters = {}, { rejectWithValue }) => {
        try {
            console.log("Fetching user payments with filters:", filters);

            const result = await paymentService.getUserPayments(filters);
            console.log("User payments result:", result);

            if (!result.IsSuccess && result.StatusCode !== 200) {
                return rejectWithValue({
                    message: result.ErrorMessage || "Failed to get user payments",
                    errors: result.ErrorMessage || []
                });
            }

            return result.Result || result.data || result;
        } catch (error) {
            console.error("Get user payments error:", error);
            return rejectWithValue({
                message: error.message || "Failed to get user payments",
                errors: error.errors || []
            });
        }
    }
);

// Get driver payments
export const getDriverPayments = createAsyncThunk(
    "payment/getDriverPayments",
    async (filters = {}, { rejectWithValue }) => {
        try {
            console.log("Fetching driver payments with filters:", filters);

            const result = await paymentService.getDriverPayments(filters);
            console.log("Driver payments result:", result);

            if (!result.IsSuccess && result.StatusCode !== 200) {
                return rejectWithValue({
                    message: result.ErrorMessage || "Failed to get driver payments",
                    errors: result.ErrorMessage || []
                });
            }

            return result.Result || result.data || result;
        } catch (error) {
            console.error("Get driver payments error:", error);
            return rejectWithValue({
                message: error.message || "Failed to get driver payments",
                errors: error.errors || []
            });
        }
    }
);

// Get admin payment stats
export const getAdminPaymentStats = createAsyncThunk(
    "payment/getAdminStats",
    async (filters = {}, { rejectWithValue }) => {
        try {
            console.log("Fetching admin payment stats with filters:", filters);

            const result = await paymentService.getAdminPaymentStats(filters);
            console.log("Admin payment stats result:", result);

            // Check using the correct property names from your API
            if (!result.IsSuccess && result.StatusCode !== 200) {
                return rejectWithValue({
                    message: result.ErrorMessage || "Failed to get admin payment stats",
                    errors: result.ErrorMessage || []
                });
            }

            return result.Result || result.data || result;
        } catch (error) {
            console.error("Get admin payment stats error:", error);
            return rejectWithValue({
                message: error.message || "Failed to get admin payment stats",
                errors: error.errors || []
            });
        }
    }
);

// Define initial state
const initialState = {
    // Payment data
    payments: [],
    currentPayment: null,
    paymentUrl: null,
    userPayments: [],
    userPaymentStats: null,
    driverPayments: [],
    driverPaymentStats: null,
    adminStats: null,
    recentPayments: [],
    paymentsByBooking: {},

    // Pagination
    pagination: {
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        limit: 10
    },

    // UI states
    loading: false,
    statsLoading: false,
    lastAction: null,

    // Error handling
    error: null,
    errorDetails: [],

    // Success states
    success: false,
    actionSuccess: false,
    successMessage: ""
};

// Create payment slice
const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        clearPaymentError: (state) => {
            state.error = null;
            state.errorDetails = [];
        },

        clearPaymentSuccess: (state) => {
            state.success = false;
            state.actionSuccess = false;
            state.successMessage = "";
        },

        resetPaymentState: (state) => {
            return initialState;
        },

        clearCurrentPayment: (state) => {
            state.currentPayment = null;
            state.paymentUrl = null;
        },

        // Reducer to handle payment completion based on URL
        setPaymentCompletionStatus: (state, action) => {
            const { status } = action.payload;
            state.loading = false;

            if (status === 'success') {
                state.success = true;
                state.actionSuccess = true;
                state.successMessage = "Payment completed successfully";
            } else if (status === 'cancel') {
                state.success = false;
                state.error = "Payment was canceled";
            } else if (status === 'failed') {
                state.success = false;
                state.error = "Payment failed";
            } else if (status === 'error') {
                state.success = false;
                state.error = "An error occurred during payment processing";
            }

            state.lastAction = Date.now();
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
                state.actionSuccess = false;
                state.paymentUrl = null;
            })
            .addCase(initiatePayment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.actionSuccess = true;
                state.successMessage = "Payment initiated successfully";
                state.lastAction = Date.now();

                // Store current payment
                state.currentPayment = action.payload.payment || action.payload;

                // For Khalti, store payment URL for redirect
                if (action.payload.payment_url) {
                    state.paymentUrl = action.payload.payment_url;
                }
            })
            .addCase(initiatePayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Payment initiation failed";
                state.errorDetails = action.payload?.errors || [];
                state.success = false;
                state.actionSuccess = false;
            })

            // Complete Khalti Payment
            .addCase(completeKhaltiPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorDetails = [];
                state.success = false;
            })
            .addCase(completeKhaltiPayment.fulfilled, (state, action) => {
                state.loading = false;

                // Note: This might not be reached due to redirect behavior
                // The setPaymentCompletionStatus reducer will handle the state update
                // based on the redirect URL

                if (action.payload?.payment) {
                    state.currentPayment = action.payload.payment;

                    if (state.currentPayment.status === "completed") {
                        state.success = true;
                        state.actionSuccess = true;
                        state.successMessage = "Payment completed successfully";
                    } else if (state.currentPayment.status === "canceled") {
                        state.error = "Payment was canceled";
                    } else if (state.currentPayment.status === "failed") {
                        state.error = "Payment failed";
                    }
                }

                state.lastAction = Date.now();
            })
            .addCase(completeKhaltiPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to complete payment";
                state.errorDetails = action.payload?.errors || [];
                state.success = false;
            })

            // Check Khalti Payment Status
            .addCase(checkKhaltiPaymentStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorDetails = [];
            })
            .addCase(checkKhaltiPaymentStatus.fulfilled, (state, action) => {
                state.loading = false;

                // If payment status is returned
                if (action.payload?.payment) {
                    state.currentPayment = action.payload.payment;

                    // Set success based on payment status
                    if (state.currentPayment.status === "completed") {
                        state.success = true;
                        state.actionSuccess = true;
                        state.successMessage = "Payment completed successfully";
                    }
                }

                state.lastAction = Date.now();
            })
            .addCase(checkKhaltiPaymentStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to check payment status";
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
                state.currentPayment = action.payload.payment;

                // Set success based on payment status
                if (state.currentPayment?.status === "completed") {
                    state.successMessage = "Payment completed successfully";
                }

                state.lastAction = Date.now();
            })
            .addCase(getPaymentDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to get payment details";
                state.errorDetails = action.payload?.errors || [];
            })

            // Get Payment Status By Booking
            .addCase(getPaymentStatusByBooking.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorDetails = [];
            })
            .addCase(getPaymentStatusByBooking.fulfilled, (state, action) => {
                state.loading = false;

                // Store payment in lookup object
                if (action.payload.payment) {
                    const bookingId = action.payload.payment.booking;
                    state.paymentsByBooking[bookingId] = action.payload.payment;
                }

                state.lastAction = Date.now();
            })
            .addCase(getPaymentStatusByBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to get payment status";
                state.errorDetails = action.payload?.errors || [];
            })

            // Get All Payments (Admin)
            .addCase(getAllPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorDetails = [];
            })
            .addCase(getAllPayments.fulfilled, (state, action) => {
                state.loading = false;
                // Make sure we're accessing the correct property structure
                console.log("getAllPayments fulfilled with payload:", action.payload);
                state.payments = action.payload.payments || [];

                // Store pagination if provided
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination;
                }

                state.lastAction = Date.now();
            })
            .addCase(getAllPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to get payments";
                state.errorDetails = action.payload?.errors || [];
            })

            // Get User Payments
            .addCase(getUserPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorDetails = [];
            })
            .addCase(getUserPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.userPayments = action.payload.payments || [];
                state.userPaymentStats = action.payload.stats || null;

                // Store pagination if provided
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination;
                }

                state.lastAction = Date.now();
            })
            .addCase(getUserPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to get user payments";
                state.errorDetails = action.payload?.errors || [];
            })

            // Get Driver Payments
            .addCase(getDriverPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.errorDetails = [];
            })
            .addCase(getDriverPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.driverPayments = action.payload.payments || [];
                state.driverPaymentStats = action.payload.stats || null;

                // Store pagination if provided
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination;
                }

                state.lastAction = Date.now();
            })
            .addCase(getDriverPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Failed to get driver payments";
                state.errorDetails = action.payload?.errors || [];
            })

            // Get Admin Payment Stats
            .addCase(getAdminPaymentStats.pending, (state) => {
                state.statsLoading = true;
                state.error = null;
                state.errorDetails = [];
            })
            .addCase(getAdminPaymentStats.fulfilled, (state, action) => {
                state.statsLoading = false;

                // Log what we received to debug the payload structure
                console.log("getAdminPaymentStats fulfilled with payload:", action.payload);

                // Extract stats and recentPayments based on your API response structure
                state.adminStats = action.payload.stats || null;
                state.recentPayments = action.payload.recentPayments || [];

                state.lastAction = Date.now();
            })
            .addCase(getAdminPaymentStats.rejected, (state, action) => {
                state.statsLoading = false;
                state.error = action.payload?.message || "Failed to get admin payment stats";
                state.errorDetails = action.payload?.errors || [];
            });
    },
});

// Export actions
export const {
    clearPaymentError,
    clearPaymentSuccess,
    resetPaymentState,
    clearCurrentPayment,
    setPaymentCompletionStatus
} = paymentSlice.actions;

// Export helper functions from service
export const { handleKhaltiRedirect, extractKhaltiCallbackParams } = paymentService;

// Export reducer
export default paymentSlice.reducer;