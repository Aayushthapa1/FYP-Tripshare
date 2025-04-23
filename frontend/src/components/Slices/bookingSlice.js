import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import bookingService from "../../services/bookingService";

// ===== USER BOOKING ACTIONS =====
// 1) Create booking
export const createBooking = createAsyncThunk(
  "booking/create",
  async ({ tripId, seats, paymentMethod }, { rejectWithValue }) => {
    try {
      // Validate seats
      seats = Number(seats);
      if (isNaN(seats) || seats < 1) {
        throw new Error("Invalid seats value");
      }

      // Validate payment method
      if (!["COD", "online"].includes(paymentMethod)) {
        throw new Error("Invalid payment method");
      }

      // Call the service function to create booking
      const result = await bookingService.createBooking({ tripId, seats, paymentMethod });
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 2) Get all bookings for current user
export const fetchMyBookings = createAsyncThunk(
  "booking/getMyBookings",
  async (_, { rejectWithValue }) => {
    try {
      const result = await bookingService.getMyBookings();
      console.log("the result is", result);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 3) Get booking details
export const getBookingDetails = createAsyncThunk(
  "booking/getBookingDetails",
  async (bookingId, thunkAPI) => {
    try {
      const result = await bookingService.fetchBookingDetails(bookingId);
      console.log("the result is", result);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.errors && error.response.data.errors[0]?.message) ||
        error.message ||
        error.toString();

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// 4) Cancel booking
export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      return await bookingService.cancelBooking(bookingId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ===== DRIVER BOOKING ACTIONS =====
// 5) Get pending bookings for driver
export const fetchDriverPendingBookings = createAsyncThunk(
  "booking/getDriverPendingBookings",
  async (_, { rejectWithValue }) => {
    try {

const result =  await bookingService.getDriverPendingBookings();
console.log("the result is", result)
return result?.Result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 6) Get all bookings for driver
export const fetchDriverBookings = createAsyncThunk(
  "booking/getDriverBookings",
  async (_, { rejectWithValue }) => {
    try {
      const result =await bookingService.getDriverBookings();
      return result.Result
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 7) Accept booking
export const acceptBooking = createAsyncThunk(
  "booking/acceptBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      return await bookingService.acceptBooking(bookingId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 8) Reject booking
export const rejectBooking = createAsyncThunk(
  "booking/rejectBooking",
  async ({ bookingId, reason }, { rejectWithValue }) => {
    try {
      return await bookingService.rejectBooking(bookingId, reason);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 9) Complete booking
export const completeBooking = createAsyncThunk(
  "booking/completeBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      return await bookingService.completeBooking(bookingId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    loading: false,
    error: null,
    myBookings: [],         // Store user's bookings
    driverBookings: [],     // Store driver's bookings
    pendingBookings: [],    // Store driver's pending bookings
    currentBooking: null,   // Store a single booking detail
    lastAction: null,       // Track last update time
    actionSuccess: false,   // Flag for successful actions
  },
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
    resetBookingState: (state) => {
      state.loading = false;
      state.error = null;
      state.myBookings = [];
      state.driverBookings = [];
      state.pendingBookings = [];
      state.currentBooking = null;
      state.lastAction = null;
      state.actionSuccess = false;
    },
    clearActionSuccess: (state) => {
      state.actionSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ==== CREATE BOOKING ====
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.lastAction = Date.now();
        state.actionSuccess = true;
        // Add new booking to myBookings if needed
        if (action.payload?.booking) {
          state.myBookings.unshift(action.payload.booking);
          state.currentBooking = action.payload.booking;
        }
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.actionSuccess = false;
      })

      // ==== GET MY BOOKINGS ====
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        // Handle different response formats
        state.myBookings = action.payload?.Result?.bookings ||
          action.payload?.data?.bookings ||
          action.payload?.bookings ||
          [];
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==== GET BOOKING DETAILS ====
      .addCase(getBookingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingDetails.fulfilled, (state, action) => {
        state.loading = false;
        // Handle different response formats
        state.currentBooking = action.payload?.data?.booking ||
          action.payload?.booking ||
          null;
      })
      .addCase(getBookingDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==== CANCEL BOOKING ====
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;

        // Extract booking data from response
        const updatedBooking = action.payload?.booking ||
          action.payload?.data?.booking ||
          action.payload;

        // Update in myBookings array
        if (updatedBooking?._id) {
          state.myBookings = state.myBookings.map((b) =>
            b._id === updatedBooking._id ? updatedBooking : b
          );

          // Update currentBooking if it matches
          if (state.currentBooking?._id === updatedBooking._id) {
            state.currentBooking = updatedBooking;
          }
        }

        state.lastAction = Date.now();
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.actionSuccess = false;
      })

      // ==== DRIVER: GET PENDING BOOKINGS ====
      .addCase(fetchDriverPendingBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverPendingBookings.fulfilled, (state, action) => {
        state.loading = false;
        // Handle different response formats
        state.pendingBookings = action.payload?.data?.bookings ||
          action.payload?.bookings ||
          [];
      })
      .addCase(fetchDriverPendingBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==== DRIVER: GET ALL BOOKINGS ====
      .addCase(fetchDriverBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverBookings.fulfilled, (state, action) => {
        state.loading = false;
        // Handle different response formats
        state.driverBookings = action.payload?.data?.bookings ||
          action.payload?.bookings ||
          [];
      })
      .addCase(fetchDriverBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==== DRIVER: ACCEPT BOOKING ====
      .addCase(acceptBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(acceptBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;

        // Extract booking data from response
        const updatedBooking = action.payload?.booking ||
          action.payload?.data?.booking ||
          action.payload;

        // Update in pendingBookings and driverBookings arrays
        if (updatedBooking?._id) {
          // Remove from pending bookings
          state.pendingBookings = state.pendingBookings.filter(
            booking => booking._id !== updatedBooking._id
          );

          // Update in driverBookings if it exists
          const existsInDriverBookings = state.driverBookings.some(
            booking => booking._id === updatedBooking._id
          );

          if (existsInDriverBookings) {
            state.driverBookings = state.driverBookings.map(
              booking => booking._id === updatedBooking._id ? updatedBooking : booking
            );
          } else {
            state.driverBookings.push(updatedBooking);
          }

          // Update currentBooking if it matches
          if (state.currentBooking?._id === updatedBooking._id) {
            state.currentBooking = updatedBooking;
          }
        }

        state.lastAction = Date.now();
      })
      .addCase(acceptBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.actionSuccess = false;
      })

      // ==== DRIVER: REJECT BOOKING ====
      .addCase(rejectBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(rejectBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;

        // Extract booking data from response
        const updatedBooking = action.payload?.booking ||
          action.payload?.data?.booking ||
          action.payload;

        // Update both booking arrays
        if (updatedBooking?._id) {
          // Remove from pending bookings
          state.pendingBookings = state.pendingBookings.filter(
            booking => booking._id !== updatedBooking._id
          );

          // Update in driverBookings
          state.driverBookings = state.driverBookings.map(
            booking => booking._id === updatedBooking._id ? updatedBooking : booking
          );

          // Update currentBooking if it matches
          if (state.currentBooking?._id === updatedBooking._id) {
            state.currentBooking = updatedBooking;
          }
        }

        state.lastAction = Date.now();
      })
      .addCase(rejectBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.actionSuccess = false;
      })

      // ==== DRIVER: COMPLETE BOOKING ====
      .addCase(completeBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(completeBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;

        // Extract booking data from response
        const updatedBooking = action.payload?.booking ||
          action.payload?.data?.booking ||
          action.payload;

        // Update in driverBookings array
        if (updatedBooking?._id) {
          state.driverBookings = state.driverBookings.map(
            booking => booking._id === updatedBooking._id ? updatedBooking : booking
          );

          // Update currentBooking if it matches
          if (state.currentBooking?._id === updatedBooking._id) {
            state.currentBooking = updatedBooking;
          }
        }

        state.lastAction = Date.now();
      })
      .addCase(completeBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.actionSuccess = false;
      });
  },
});

export const { clearBookingError, resetBookingState, clearActionSuccess } = bookingSlice.actions;
export default bookingSlice.reducer;