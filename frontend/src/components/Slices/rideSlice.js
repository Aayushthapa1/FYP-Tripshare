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
  // Track if a ride was recently completed to show the completion modal
  recentlyCompleted: false,
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
  async (statusData, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await rideService.updateRideStatus(statusData);

      // If status was updated to completed, set our flag for recently completed
      if (response.success && statusData.status === "completed") {
        // Flag this ride as recently completed to trigger the completion modal
        setTimeout(() => {
          dispatch(clearRecentlyCompleted());
        }, 60000); // Clear the flag after 1 minute
      }

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
  async (params, { rejectWithValue, getState }) => {
    try {
      const response = await rideService.getActiveRide(params);

      // Check if ride is completed but we haven't shown the completion modal yet
      const state = getState();
      if (response.success &&
        response.data.status === "completed" &&
        !state.ride.recentlyCompleted) {
        // Mark ride as recently completed to trigger modal
        // This is handled separately in the reducer
      }

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
    clearRecentlyCompleted: (state) => {
      state.recentlyCompleted = false;
    },
    resetRideState: (state) => {
      state.currentRide = null;
      state.rideHistory = [];
      state.activeRide = null;
      state.searchResults = [];
      state.loading = false;
      state.error = null;
      state.message = null;
      state.recentlyCompleted = false;
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

          // If status is now completed, update our active ride and set flag
          if (action.payload.data.status === "completed") {
            state.activeRide = action.payload.data;
            state.recentlyCompleted = true;
          }
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

          // If ride was completed, flag it to show the completion modal
          if (action.payload.data && action.payload.data.status === "completed") {
            // Only set to true if it's not already completed (first time seeing it)
            if (!state.recentlyCompleted) {
              state.recentlyCompleted = true;
            }
          }
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

export const {
  clearRideError,
  clearRideMessage,
  clearRecentlyCompleted,
  resetRideState
} = rideSlice.actions;

export default rideSlice.reducer;