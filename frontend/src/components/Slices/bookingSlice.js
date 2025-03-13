// src/store/slices/bookingSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import bookingService from "../../services/bookingService";

// 1) Create booking
export const createBooking = createAsyncThunk(
  "booking/create",
  async ({ tripId, seats }, { rejectWithValue }) => {
    try {
      return await bookingService.createBooking({ tripId, seats });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 2) Get all bookings for current user
export const getMyBookings = createAsyncThunk(
  "booking/getMyBookings",
  async (_, { rejectWithValue }) => {
    try {
      return await bookingService.getMyBookings();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 3) Get booking details
export const getBookingDetails = createAsyncThunk(
  "booking/getBookingDetails",
  async (bookingId, { rejectWithValue }) => {
    try {
      return await bookingService.getBookingDetails(bookingId);
    } catch (err) {
      return rejectWithValue(err.message);
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

const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    loading: false,
    error: null,
    myBookings: [],       // store user’s bookings
    currentBooking: null, // store a single booking detail
    lastAction: null,     // optional, track last time we updated
  },
  reducers: {
    // optional synchronous actions
    clearBookingError: (state) => {
      state.error = null;
    },
    resetBookingState: (state) => {
      state.loading = false;
      state.error = null;
      state.myBookings = [];
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE BOOKING
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        // We don't necessarily store newly created booking in a list here
        // But you could push it to myBookings if you want
        state.lastAction = Date.now();
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET MY BOOKINGS
      .addCase(getMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings = action.payload; // array of bookings
      })
      .addCase(getMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET BOOKING DETAILS
      .addCase(getBookingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload; // single booking object
      })
      .addCase(getBookingDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CANCEL BOOKING
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload; // updated booking doc
        // If we have myBookings loaded, we can update that booking in the array
        state.myBookings = state.myBookings.map((b) =>
          b._id === updated._id ? updated : b
        );
        // If currentBooking is the same, update it
        if (state.currentBooking?._id === updated._id) {
          state.currentBooking = updated;
        }
        state.lastAction = Date.now();
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBookingError, resetBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
