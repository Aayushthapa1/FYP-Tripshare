import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import bookingService from "../../services/bookingService";

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
      return result
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
      return await bookingService.getMyBookings();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 3) Get booking details
export const getBookingDetails = createAsyncThunk("booking/getBookingDetails", async (bookingId, thunkAPI) => {
  try {
    return await bookingService.fetchBookingDetails(bookingId)
  } catch (error) {
    const message =
      (error.response && error.response.data && error.response.data.errors && error.response.data.errors[0]?.message) ||
      error.message ||
      error.toString()

    return thunkAPI.rejectWithValue(message)
  }
})

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
    myBookings: [],       // Store user’s bookings
    currentBooking: null, // Store a single booking detail
    lastAction: null,  
       // Track last update time
  },
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
    resetBookingState: (state) => {
      state.loading = false;
      state.error = null;
      state.myBookings = [];
      state.currentBooking = null;
      state.lastAction = null;
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
        state.lastAction = Date.now();
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET MY BOOKINGS
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        // If your service returns an array of bookings, store it:
        state.myBookings = action.payload?.Result?.bookings || action.payload.bookings || [];
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // GET BOOKING DETAILS
      .addCase(getBookingDetails.pending, (state) => {
        state.loading = true
      })
      .addCase(getBookingDetails.fulfilled, (state, action) => {
        state.loading = false
        state.isSuccess = true
        state.booking = action.payload.data.booking
      })
      .addCase(getBookingDetails.rejected, (state, action) => {
        state.loading = false
        state.error = true
        state.message = action.payload
      })

      // CANCEL BOOKING
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBooking = action.payload;
        state.myBookings = state.myBookings.map((b) =>
          b._id === updatedBooking._id ? updatedBooking : b
        );
        if (state.currentBooking?._id === updatedBooking._id) {
          state.currentBooking = updatedBooking;
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
