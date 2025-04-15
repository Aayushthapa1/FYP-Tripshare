// Slices/ratingSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ratingService from "../../services/ratingService";

// 1) CREATE a rating
export const createRating = createAsyncThunk(
    "rating/create",
    async ({ rideId, rating, feedback }, { rejectWithValue }) => {
        try {
            return await ratingService.createRating(rideId, { rating, feedback });
            // Should return { message, rating: {...} } or similar
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

// 2) GET all ratings for a driver
export const getDriverRatings = createAsyncThunk(
    "rating/getDriverRatings",
    async (driverId, { rejectWithValue }) => {
        try {
            return await ratingService.getDriverRatings(driverId);
            // { message, averageRating, count, ratings[] }
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

// 3) GET all ratings for a ride
export const getRideRatings = createAsyncThunk(
    "rating/getRideRatings",
    async (rideId, { rejectWithValue }) => {
        try {
            return await ratingService.getRideRatings(rideId);
            // { message, ratings[] }
        } catch (err) {
            return rejectWithValue(err);
        }
    }
);

const ratingSlice = createSlice({
    name: "rating",
    initialState: {
        loading: false,
        error: null,
        createdRating: null,

        // For retrieving driver’s ratings
        driverRatings: [],
        averageRating: null,
        driverRatingCount: 0,

        // For retrieving ride’s ratings
        rideRatings: [],
    },
    reducers: {
        clearRatingError(state) {
            state.error = null;
        },
        resetRatingState(state) {
            state.loading = false;
            state.error = null;
            state.createdRating = null;
            state.driverRatings = [];
            state.averageRating = null;
            state.driverRatingCount = 0;
            state.rideRatings = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // CREATE RATING
            .addCase(createRating.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createRating.fulfilled, (state, action) => {
                state.loading = false;
                // Typically action.payload = { message: '...', rating: {...} }
                state.createdRating = action.payload.rating;
            })
            .addCase(createRating.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.payload || "Error";
            })

            // GET DRIVER RATINGS
            .addCase(getDriverRatings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDriverRatings.fulfilled, (state, action) => {
                state.loading = false;
                const { averageRating, count, ratings } = action.payload;
                state.averageRating = averageRating || 0;
                state.driverRatingCount = count || 0;
                state.driverRatings = ratings || [];
            })
            .addCase(getDriverRatings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.payload || "Error";
            })

            // GET RIDE RATINGS
            .addCase(getRideRatings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRideRatings.fulfilled, (state, action) => {
                state.loading = false;
                state.rideRatings = action.payload.ratings || [];
            })
            .addCase(getRideRatings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || action.payload || "Error";
            });
    },
});

export const { clearRatingError, resetRatingState } = ratingSlice.actions;
export default ratingSlice.reducer;
