import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import rideService from '../../services/rideService';

// Initial state
const initialState = {
  activeRide: null,
  rideHistory: [],
  availableDrivers: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
  loading: {
    activeRide: false,
    rideHistory: false,
    requestRide: false,
    updateStatus: false,
    searchDrivers: false,
    rateRide: false,
  },
  error: {
    activeRide: null,
    rideHistory: null,
    requestRide: null,
    updateStatus: null,
    searchDrivers: null,
    rateRide: null,
  },
};

// Async thunks
export const requestRide = createAsyncThunk(
  'ride/requestRide',
  async (rideData, { rejectWithValue }) => {
    try {
      return await rideService.requestRide(rideData);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateRideStatus = createAsyncThunk(
  'ride/updateStatus',
  async (updateData, { rejectWithValue }) => {
    try {
      return await rideService.updateRideStatus(updateData);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchActiveRide = createAsyncThunk(
  'ride/fetchActiveRide',
  async (params, { rejectWithValue }) => {
    try {
      return await rideService.getActiveRide(params);
    } catch (error) {
      // If 404 (no active ride), return null without error
      if (error.status === 404) {
        return null;
      }
      return rejectWithValue(error);
    }
  }
);

export const fetchRideHistory = createAsyncThunk(
  'ride/fetchRideHistory',
  async (params, { rejectWithValue }) => {
    try {
      return await rideService.getRideHistory(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const searchDrivers = createAsyncThunk(
  'ride/searchDrivers',
  async (params, { rejectWithValue }) => {
    try {
      return await rideService.searchDrivers(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  'ride/updatePaymentStatus',
  async (paymentData, { rejectWithValue }) => {
    try {
      return await rideService.updatePaymentStatus(paymentData);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const rateRide = createAsyncThunk(
  'ride/rateRide',
  async (ratingData, { rejectWithValue }) => {
    try {
      return await rideService.rateRide(ratingData);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Ride slice
const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    clearActiveRide: (state) => {
      state.activeRide = null;
    },
    clearRideErrors: (state) => {
      state.error = {
        activeRide: null,
        rideHistory: null,
        requestRide: null,
        updateStatus: null,
        searchDrivers: null,
        rateRide: null,
      };
    },
    setActivePage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Request Ride
    builder
      .addCase(requestRide.pending, (state) => {
        state.loading.requestRide = true;
        state.error.requestRide = null;
      })
      .addCase(requestRide.fulfilled, (state, action) => {
        state.loading.requestRide = false;
        state.activeRide = action.payload.data;
      })
      .addCase(requestRide.rejected, (state, action) => {
        state.loading.requestRide = false;
        state.error.requestRide = action.payload;
      });

    // Update Ride Status
    builder
      .addCase(updateRideStatus.pending, (state) => {
        state.loading.updateStatus = true;
        state.error.updateStatus = null;
      })
      .addCase(updateRideStatus.fulfilled, (state, action) => {
        state.loading.updateStatus = false;
        
        // Update active ride if it's the same ride
        if (state.activeRide && state.activeRide._id === action.payload.data._id) {
          state.activeRide = action.payload.data;
        }
        
        // Update ride in history if it exists there
        const index = state.rideHistory.findIndex(ride => ride._id === action.payload.data._id);
        if (index !== -1) {
          state.rideHistory[index] = action.payload.data;
        }
      })
      .addCase(updateRideStatus.rejected, (state, action) => {
        state.loading.updateStatus = false;
        state.error.updateStatus = action.payload;
      });

    // Fetch Active Ride
    builder
      .addCase(fetchActiveRide.pending, (state) => {
        state.loading.activeRide = true;
        state.error.activeRide = null;
      })
      .addCase(fetchActiveRide.fulfilled, (state, action) => {
        state.loading.activeRide = false;
        state.activeRide = action.payload?.data || null;
      })
      .addCase(fetchActiveRide.rejected, (state, action) => {
        state.loading.activeRide = false;
        state.error.activeRide = action.payload;
        state.activeRide = null;
      });

    // Fetch Ride History
    builder
      .addCase(fetchRideHistory.pending, (state) => {
        state.loading.rideHistory = true;
        state.error.rideHistory = null;
      })
      .addCase(fetchRideHistory.fulfilled, (state, action) => {
        state.loading.rideHistory = false;
        state.rideHistory = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRideHistory.rejected, (state, action) => {
        state.loading.rideHistory = false;
        state.error.rideHistory = action.payload;
      });

    // Search Drivers
    builder
      .addCase(searchDrivers.pending, (state) => {
        state.loading.searchDrivers = true;
        state.error.searchDrivers = null;
      })
      .addCase(searchDrivers.fulfilled, (state, action) => {
        state.loading.searchDrivers = false;
        state.availableDrivers = action.payload.data;
      })
      .addCase(searchDrivers.rejected, (state, action) => {
        state.loading.searchDrivers = false;
        state.error.searchDrivers = action.payload;
      });

    // Rate Ride
    builder
      .addCase(rateRide.pending, (state) => {
        state.loading.rateRide = true;
        state.error.rateRide = null;
      })
      .addCase(rateRide.fulfilled, (state, action) => {
        state.loading.rateRide = false;
        
        // Update ride in history if it exists there
        const index = state.rideHistory.findIndex(ride => ride._id === action.payload.data._id);
        if (index !== -1) {
          state.rideHistory[index] = action.payload.data;
        }
      })
      .addCase(rateRide.rejected, (state, action) => {
        state.loading.rateRide = false;
        state.error.rateRide = action.payload;
      });
  },
});

// Export actions and reducer
export const { clearActiveRide, clearRideErrors, setActivePage } = rideSlice.actions;
export default rideSlice.reducer;

// Selectors
export const selectActiveRide = (state) => state.ride.activeRide;
export const selectRideHistory = (state) => state.ride.rideHistory;
export const selectAvailableDrivers = (state) => state.ride.availableDrivers;
export const selectRidePagination = (state) => state.ride.pagination;
export const selectRideLoading = (state) => state.ride.loading;
export const selectRideErrors = (state) => state.ride.error;