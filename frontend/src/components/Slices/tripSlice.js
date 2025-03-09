import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import tripService from '../../services/tripService';

export const createNewTrip = createAsyncThunk(
  'trips/create',
  async (tripData, { rejectWithValue }) => {
    try {
      return await tripService.createTrip(tripData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTrips = createAsyncThunk(
  'trips/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await tripService.getTrips();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateExistingTrip = createAsyncThunk(
  'trips/update',
  async ({ tripId, tripData }, { rejectWithValue }) => {
    try {
      return await tripService.updateTrip(tripId, tripData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteExistingTrip = createAsyncThunk(
  'trips/delete',
  async (tripId, { rejectWithValue }) => {
    try {
      await tripService.deleteTrip(tripId);
      return tripId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTripById = createAsyncThunk(
  'trips/${tripId}',
  async (tripId, { rejectWithValue }) => {
    try {
      return await tripService.getTripById(tripId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getTrips = createAsyncThunk(
  'trips/all',
  async (_, { rejectWithValue }) => {
    try {
      return await tripService.getTrips();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


const tripSlice = createSlice({
  name: 'trips',
  initialState: {
    trips: [],
    currentTrip: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentTrip: (state, action) => {
      state.currentTrip = action.payload;
    },
    clearTripError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.trips.push(action.payload);
      })
      .addCase(createNewTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload;
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateExistingTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = state.trips.map(trip =>
          trip._id === action.payload._id ? action.payload : trip
        );
      })
      .addCase(updateExistingTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteExistingTrip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExistingTrip.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = state.trips.filter(trip => trip._id !== action.payload);
      })
      .addCase(deleteExistingTrip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      }
      )
      .addCase(getTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.trips = action.payload;
      }
      )
      .addCase(getTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }
      )
      .addCase(getTripById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTripById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTrip = action.payload;
      })
      .addCase(getTripById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addDefaultCase((state) => {
        return state;
      });
  }
});

export const { setCurrentTrip, clearTripError } = tripSlice.actions;
export default tripSlice.reducer;