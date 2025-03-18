import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import paymentService from "../../services/paymentService";

// 1️⃣ Create a new payment
export const createPayment = createAsyncThunk(
    "payment/create",
    async ({ bookingId, amount, paymentMethod, transactionId, khaltiToken }, { rejectWithValue }) => {
        try {
            return await paymentService.createPayment({ bookingId, amount, paymentMethod, transactionId, khaltiToken });
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// 2️⃣ Get a single payment details
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

// 3️⃣ Get all payments for the logged-in user
export const getAllPayments = createAsyncThunk(
    "payment/getAll",
    async (_, { rejectWithValue }) => {
        try {
            return await paymentService.getAllPayments();
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// 4️⃣ Verify eSewa Payment
export const verifyEsewaPayment = createAsyncThunk(
    "payment/verifyEsewa",
    async ({ amount, transactionId }, { rejectWithValue }) => {
        try {
            return await paymentService.verifyEsewaPayment({ amount, transactionId });
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// 5️⃣ Verify Khalti Payment
export const verifyKhaltiPayment = createAsyncThunk(
    "payment/verifyKhalti",
    async ({ khaltiToken, amount }, { rejectWithValue }) => {
        try {
            return await paymentService.verifyKhaltiPayment({ khaltiToken, amount });
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const paymentSlice = createSlice({
    name: "payment",
    initialState: {
        loading: false,
        error: null,
        payments: [],       // Store all user’s payments
        currentPayment: null, // Store single payment detail
        lastAction: null,   // Track last update time
    },
    reducers: {
        clearPaymentError: (state) => {
            state.error = null;
        },
        resetPaymentState: (state) => {
            state.loading = false;
            state.error = null;
            state.payments = [];
            state.currentPayment = null;
            state.lastAction = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // CREATE PAYMENT
            .addCase(createPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.lastAction = Date.now();
            })
            .addCase(createPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // GET PAYMENT DETAILS
            .addCase(getPaymentDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPaymentDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPayment = action.payload;
            })
            .addCase(getPaymentDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // GET ALL PAYMENTS
            .addCase(getAllPayments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllPayments.fulfilled, (state, action) => {
                state.loading = false;
                state.payments = action.payload;
            })
            .addCase(getAllPayments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // VERIFY ESEWA PAYMENT
            .addCase(verifyEsewaPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyEsewaPayment.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(verifyEsewaPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // VERIFY KHALTI PAYMENT
            .addCase(verifyKhaltiPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyKhaltiPayment.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(verifyKhaltiPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearPaymentError, resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;
