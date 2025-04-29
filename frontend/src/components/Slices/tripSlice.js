// src/Slices/tripSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import tripService from "../../services/tripService";

// Thunks
export const createTrip = createAsyncThunk(
  "trip/createTrip",
  async (formData, { rejectWithValue }) => {
    try {
      const createdTrip = await tripService.createTrip(formData);
      return createdTrip; // single trip object
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getTrips = createAsyncThunk(
  "trip/getTrips",
  async (_, { rejectWithValue }) => {
    try {
      const allTrips = await tripService.getTrips();
      return allTrips; // array of trips
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getTripById = createAsyncThunk(
  "trip/getTripById",
  async (tripId, { rejectWithValue }) => {
    try {
      const singleTrip = await tripService.getTripById(tripId);
      return singleTrip; // single trip object
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateTrip = createAsyncThunk(
  "trip/updateTrip",
  async ({ tripId, tripData }, { rejectWithValue }) => {
    try {
      const updated = await tripService.updateTrip(tripId, tripData);
      return updated; // updated trip object
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteTrip = createAsyncThunk(
  "trip/deleteTrip",
  async (tripId, { rejectWithValue }) => {
    try {
      const deletedId = await tripService.deleteTrip(tripId);
      return deletedId; // returning the tripId
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const completeTrip = createAsyncThunk(
  "trip/completeTrip",
  async ({ tripId, completionDetails = {} }, { rejectWithValue }) => {
    try {
      const completedTrip = await tripService.completeTrip(tripId, completionDetails);
      return completedTrip;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const searchTrips = createAsyncThunk(
  "trip/searchTrips",
  async (searchParams, { rejectWithValue }) => {
    try {
      const results = await tripService.searchTrips(searchParams);
      return results; // array of trips
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchDriverTrips = createAsyncThunk(
  "trip/getDriverTrips",
  async (_, { rejectWithValue }) => {
    try {
      const driverTrips = await tripService.getDriverTrips();
      return driverTrips; // array of trips
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchDriverTripStats = createAsyncThunk(
  "trip/getDriverTripStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const stats = await tripService.getDriverTripStats(params);
      return stats;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// New action for admin trip analytics
export const fetchAdminTripAnalytics = createAsyncThunk(
  "trip/getAdminTripAnalytics",
  async (params = {}, { rejectWithValue }) => {
    try {
      const result = await tripService.getAdminTripAnalytics(params);
      console.log("Admin trip analytics result:", result);
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// New action for cleaning up expired trips
export const cleanupExpiredTrips = createAsyncThunk(
  "trip/cleanupExpired",
  async (_, { rejectWithValue }) => {
    try {
      const result = await tripService.cleanupExpiredTrips();
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// The slice
const tripSlice = createSlice({
  name: "trip",
  initialState: {
    trips: [],
    searchResults: [],
    currentTrip: null,
    loading: false,
    searchLoading: false,
    error: null,
    success: false,
    lastUpdated: null,
    stats: null,
    adminAnalytics: null,
    adminAnalyticsLoading: false,
    cleanupStats: {
      lastCleanup: null,
      removedCount: 0
    }
  },
  reducers: {
    setCurrentTrip: (state, action) => {
      state.currentTrip = action.payload;
    },
    clearTripError: (state) => {
      state.error = null;
    },
    resetTripState: (state) => {
      state.trips = [];
      state.searchResults = [];
      state.currentTrip = null;
      state.error = null;
      state.loading = false;
      state.searchLoading = false;
      state.success = false;
      state.stats = null;
      state.adminAnalytics = null;
      state.adminAnalyticsLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload) {
          state.trips.unshift(action.payload);
        }
        state.lastUpdated = Date.now();
      })
      .addCase(createTrip.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // GET TRIPS
      .addCase(getTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.trips = action.payload; // array of trips already sorted by created date
      })
      .addCase(getTrips.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // GET TRIP BY ID
      .addCase(getTripById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getTripById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentTrip = action.payload;
      })
      .addCase(getTripById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updated = action.payload;
        if (updated) {
          state.trips = state.trips.map((t) =>
            t._id === updated._id ? updated : t
          );
          if (state.currentTrip?._id === updated._id) {
            state.currentTrip = updated;
          }
        }
        state.lastUpdated = Date.now();
      })
      .addCase(updateTrip.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // COMPLETE TRIP
      .addCase(completeTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(completeTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updated = action.payload;
        if (updated) {
          state.trips = state.trips.map((t) =>
            t._id === updated._id ? updated : t
          );
          if (state.currentTrip?._id === updated._id) {
            state.currentTrip = updated;
          }
        }
        state.lastUpdated = Date.now();
      })
      .addCase(completeTrip.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const deletedId = action.payload;
        state.trips = state.trips.filter((trip) => trip._id !== deletedId);
        if (state.currentTrip?._id === deletedId) {
          state.currentTrip = null;
        }
        state.lastUpdated = Date.now();
      })
      .addCase(deleteTrip.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // SEARCH
      .addCase(searchTrips.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(searchTrips.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.success = true;
        state.searchResults = action.payload; // array
      })
      .addCase(searchTrips.rejected, (state, action) => {
        state.searchLoading = false;
        state.success = false;
        state.error = action.payload;
      })

      // GET DRIVER TRIPS
      .addCase(fetchDriverTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchDriverTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.trips = action.payload; // array of driver trips
        state.lastUpdated = Date.now();
      })
      .addCase(fetchDriverTrips.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // GET DRIVER TRIP STATS
      .addCase(fetchDriverTripStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverTripStats.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.stats = action.payload;
      })
      .addCase(fetchDriverTripStats.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

       // ADMIN TRIP ANALYTICS
       .addCase(fetchAdminTripAnalytics.pending, (state) => {
        state.adminAnalyticsLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminTripAnalytics.fulfilled, (state, action) => {
        state.adminAnalyticsLoading = false;
        state.success = true;
        state.adminAnalytics = action.payload;
      })
      .addCase(fetchAdminTripAnalytics.rejected, (state, action) => {
        state.adminAnalyticsLoading = false;
        state.success = false;
        state.error = action.payload;
      })

      // CLEANUP EXPIRED TRIPS
      .addCase(cleanupExpiredTrips.pending, (state) => {
        // We don't set the main loading state here to avoid UI disruption
        state.error = null;
      })
      .addCase(cleanupExpiredTrips.fulfilled, (state, action) => {
        state.success = true;
        if (action.payload) {
          state.cleanupStats = {
            lastCleanup: Date.now(),
            removedCount: action.payload.removedCount || 0
          };

          // If any trips were removed, we might need to refresh the trips list
          // But the backend already filters out expired trips so it's optional
        }
      })
      .addCase(cleanupExpiredTrips.rejected, (state, action) => {
        state.success = false;
        // We don't set the main error state to avoid UI disruption
        console.error("Cleanup error:", action.payload);
      });
  },
});

export const { setCurrentTrip, clearTripError, resetTripState } =
  tripSlice.actions;
export default tripSlice.reducer;