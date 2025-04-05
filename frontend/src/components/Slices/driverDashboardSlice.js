// features/tripStats/tripStatsSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import tripStatsService from "../../services/driverDashboardService"

const initialState = {
    isLoading: false,
    error: null,
    stats: {
        tripsOverTime: [],
        popularRoutes: [],
        bookingStats: {
            totalTrips: 0,
            totalSeats: 0,
            totalBooked: 0,
            occupancyRate: 0
        },
        tripStatusDistribution: [],
        completionRate: {
            total: 0,
            completed: 0,
            completionRate: 0
        }
    },
    lastFetched: null
};

// Async thunk for getting **all** driver dashboard stats
export const fetchDriverDashboardStats = createAsyncThunk(
    "tripStats/fetchDriverDashboardStats",
    async (params = {}, { rejectWithValue }) => {
        try {
            // This method calls all stats under the hood (currently just getDriverStats).
            const response = await tripStatsService.getAllDriverDashboardStats(params);
            /**
             * Expected shape (if your backend responds with createResponse-like object):
             * {
             *   success: true,
             *   data: {
             *     tripsOverTime: [...],
             *     popularRoutes: [...],
             *     bookingStats: {...},
             *     ...
             *   }
             * }
             */
            return response;
        } catch (error) {
            console.error("Driver dashboard stats thunk error:", error);
            return rejectWithValue(error || "Failed to fetch driver statistics");
        }
    }
);

// Slice
const tripStatsSlice = createSlice({
    name: "tripStats",
    initialState,
    reducers: {
        resetTripStats: (state) => {
            state.isLoading = false;
            state.error = null;
            state.stats = initialState.stats;
        },
        clearTripStatsError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Handling fetchDriverDashboardStats
            .addCase(fetchDriverDashboardStats.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDriverDashboardStats.fulfilled, (state, action) => {
                state.isLoading = false;

                // The service returns an object like { success, data: { ... } }
                const payload = action.payload;
                if (payload.success) {
                    const data = payload.data; // This is where your aggregator results live

                    // Update stats in state with whatever keys your backend sends
                    state.stats = {
                        tripsOverTime: data.tripsOverTime || [],
                        popularRoutes: data.popularRoutes || [],
                        bookingStats: data.bookingStats || initialState.stats.bookingStats,
                        tripStatusDistribution: data.tripStatusDistribution || [],
                        completionRate: data.completionRate || initialState.stats.completionRate
                    };

                    state.lastFetched = new Date().toISOString();
                } else {
                    // If the payload indicates failure or has no 'success' key
                    state.error = "Failed to fetch driver dashboard stats";
                }
            })
            .addCase(fetchDriverDashboardStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || action.error.message || "Failed to fetch driver statistics";
            });
    }
});

export const { resetTripStats, clearTripStatsError } = tripStatsSlice.actions;
export default tripStatsSlice.reducer;
