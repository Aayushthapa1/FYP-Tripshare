// src/Slices/rideSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import rideService from "../../services/rideService";

const initialState = {
  // For driver's posted ride or passenger's requested ride
  currentRide: null,
  rideHistory: [],
  activeRide: null,
  searchResults: [],
  loading: false,
  error: null,
  message: null,
  pendingRides: [],
};

/** 1) Driver posts a ride */
export const postRide = createAsyncThunk(
  "ride/postRide",
  async (postData, { rejectWithValue }) => {
    try {
      const response = await rideService.postRide(postData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/** 2) Passenger requests a ride */
export const requestRide = createAsyncThunk(
  "ride/requestRide",
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await rideService.requestRide(requestData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/** 3) Update ride status */
export const updateRideStatus = createAsyncThunk(
  "ride/updateRideStatus",
  async (statusData, { rejectWithValue }) => {
    try {
      const response = await rideService.updateRideStatus(statusData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/** 4) Get ride history */
export const getRideHistory = createAsyncThunk(
  "ride/getRideHistory",
  async (params, { rejectWithValue }) => {
    try {
      const response = await rideService.getRideHistory(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/** 5) Get active ride */
export const getActiveRide = createAsyncThunk(
  "ride/getActiveRide",
  async (params, { rejectWithValue }) => {
    try {
      const response = await rideService.getActiveRide(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/** 6) Update payment status */
export const updatePaymentStatus = createAsyncThunk(
  "ride/updatePaymentStatus",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await rideService.updatePaymentStatus(paymentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/** 7) Search drivers */
export const searchDrivers = createAsyncThunk(
  "ride/searchDrivers",
  async (params, { rejectWithValue }) => {
    try {
      const response = await rideService.searchDrivers(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/** 8) Rate ride */
export const rateRide = createAsyncThunk(
  "ride/rateRide",
  async (rateData, { rejectWithValue }) => {
    try {
      const response = await rideService.rateRide(rateData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getPendingRides = createAsyncThunk(
  "ride/getPendingRides",
  async (_, { rejectWithValue }) => {
    try {
      const response = await rideService.getPendingRides();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const rideSlice = createSlice({
  name: "ride",
  initialState,
  reducers: {
    clearRideError: (state) => {
      state.error = null;
    },
    clearRideMessage: (state) => {
      state.message = null;
    },
    resetRideState: (state) => {
      state.currentRide = null;
      state.rideHistory = [];
      state.activeRide = null;
      state.searchResults = [];
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1) postRide
      .addCase(postRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postRide.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload = { success, data: ride }
        if (action.payload.success) {
          state.currentRide = action.payload.data;
          state.message = "Ride posted successfully.";
        } else {
          // handle edge case if success: false
          state.error = action.payload.message || "Failed to post ride";
        }
      })
      .addCase(postRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 2) requestRide
      .addCase(requestRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestRide.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.currentRide = action.payload.data;
          state.message = "Ride requested successfully.";
        } else {
          state.error = action.payload.message || "Failed to request ride";
        }
      })
      .addCase(requestRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 3) updateRideStatus
      .addCase(updateRideStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRideStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          // updated ride in action.payload.data
          state.currentRide = action.payload.data;
          state.message = `Ride status updated to ${action.payload.data.status}`;
        } else {
          state.error = action.payload.message || "Failed to update ride status";
        }
      })
      .addCase(updateRideStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 4) getRideHistory
      .addCase(getRideHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRideHistory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          // ride array in action.payload.data
          state.rideHistory = action.payload.data || [];
        } else {
          state.error = action.payload.message || "Failed to fetch ride history";
        }
      })
      .addCase(getRideHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 5) getActiveRide
      .addCase(getActiveRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveRide.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.activeRide = action.payload.data;
        } else {
          // Possibly a 404 if no active ride
          state.error = action.payload.message || "No active ride found";
          state.activeRide = null;
        }
      })
      .addCase(getActiveRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.activeRide = null;
      })

      // 6) updatePaymentStatus
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          // updated ride in action.payload.data
          state.currentRide = action.payload.data;
          state.message = "Payment status updated";
        } else {
          state.error = action.payload.message || "Failed to update payment status";
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 7) searchDrivers
      .addCase(searchDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchDrivers.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          // array of drivers in action.payload.data
          state.searchResults = action.payload.data || [];
        } else {
          state.error = action.payload.message || "Failed to search drivers";
        }
      })
      .addCase(searchDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getPendingRides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingRides.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          // Must set it to an array
          state.pendingRides = action.payload.data || [];
        } else {
          state.error = action.payload.message || "Failed to fetch pending rides";
        }
      })
      .addCase(getPendingRides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 8) rateRide
      .addCase(rateRide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rateRide.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          // updated ride in action.payload.data
          state.currentRide = action.payload.data;
          state.message = "Ride rated successfully.";
        } else {
          state.error = action.payload.message || "Failed to rate ride";
        }
      })
      .addCase(rateRide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      
  },
});

export const { clearRideError, clearRideMessage, resetRideState } = rideSlice.actions;

export default rideSlice.reducer;
