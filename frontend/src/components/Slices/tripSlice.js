// src/Slices/tripSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import tripService from "../../services/tripService";

// Thunks (could be inline or separate)
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

export const bookSeat = createAsyncThunk(
  "trip/bookSeat",
  async (tripId, { rejectWithValue }) => {
    try {
      const updatedTrip = await tripService.bookSeat(tripId);
      return updatedTrip; // updated trip object
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
        state.trips = action.payload; // array of trips
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

      // BOOK SEAT
      .addCase(bookSeat.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(bookSeat.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updatedTrip = action.payload;
        if (updatedTrip) {
          // Replace the trip in the array
          state.trips = state.trips.map((t) =>
            t._id === updatedTrip._id ? updatedTrip : t
          );
          // Update currentTrip if it's the same
          if (state.currentTrip?._id === updatedTrip._id) {
            state.currentTrip = updatedTrip;
          }
        }
        state.lastUpdated = Date.now();
      })
      .addCase(bookSeat.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentTrip, clearTripError, resetTripState } =
  tripSlice.actions;
export default tripSlice.reducer;
