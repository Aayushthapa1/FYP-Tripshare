import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ratingService from "../../services/ratingService";

// ===== USER RATING ACTIONS =====
// 1) Submit a new rating
export const submitRating = createAsyncThunk(
  "rating/submit",
  async ({ referenceId, referenceType, rating, review, categoryRatings }, { rejectWithValue }) => {
    try {
      // Validate rating
      rating = Number(rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      // Validate reference type
      if (!["Trip", "Ride"].includes(referenceType)) {
        throw new Error("Invalid reference type");
      }

      const result = await ratingService.submitRating({
        referenceId,
        referenceType,
        rating,
        review,
        categoryRatings
      });
      return result;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to submit rating");
    }
  }
);

// 2) Get all ratings submitted by current user
export const fetchUserRatings = createAsyncThunk(
  "rating/getUserRatings",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const result = await ratingService.getUserRatings(page, limit);
      return result;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch user ratings");
    }
  }
);

// 3) Get a specific rating by ID
export const getRatingById = createAsyncThunk(
  "rating/getById",
  async (ratingId, { rejectWithValue }) => {
    try {
      if (!ratingId) {
        throw new Error("Rating ID is required");
      }
      const result = await ratingService.getRatingById(ratingId);
      return result;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch rating");
    }
  }
);

// ===== DRIVER RATING ACTIONS =====
// 4) Get all ratings for a driver
export const fetchDriverRatings = createAsyncThunk(
  "rating/getDriverRatings",
  async ({ driverId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      if (!driverId) {
        throw new Error("Driver ID is required");
      }
      const result = await ratingService.getDriverRatings(driverId, page, limit);
      console.log("Ddddddddddddriver Ratings Result:", result);
      return result;
    } catch (err) {
      console.error("Errorrrrrrrr fetching driver ratings:", err);
      return rejectWithValue(err.message || "Failed to fetch driver ratings");
    }
  }
);

// 5) Get rating summary for a driver
export const fetchDriverRatingSummary = createAsyncThunk(
  "rating/getDriverSummary",
  async (driverId, { rejectWithValue }) => {
    try {
      if (!driverId) {
        throw new Error("Driver ID is required");
      }
      const result = await ratingService.getDriverRatingSummary(driverId);
      return result;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch driver rating summary");
    }
  }
);

// ===== ADMIN ACTIONS =====
// 6) Moderate a rating (admin only)
export const moderateRating = createAsyncThunk(
  "rating/moderate",
  async ({ ratingId, action, reason }, { rejectWithValue }) => {
    try {
      if (!ratingId) {
        throw new Error("Rating ID is required");
      }
      if (!["flag", "delete"].includes(action)) {
        throw new Error("Invalid moderation action");
      }
      return await ratingService.moderateRating(ratingId, { action, reason });
    } catch (err) {
      return rejectWithValue(err.message || "Failed to moderate rating");
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  userRatings: [],
  driverRatings: [],
  currentRating: null,
  driverSummary: null,
  lastAction: null,
  actionSuccess: false,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0
  }
};

const ratingSlice = createSlice({
  name: "rating",
  initialState,
  reducers: {
    clearRatingError: (state) => {
      state.error = null;
    },
    resetRatingState: () => initialState,
    clearActionSuccess: (state) => {
      state.actionSuccess = false;
      state.lastAction = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit Rating
      .addCase(submitRating.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(submitRating.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.lastAction = Date.now();
        if (action.payload?.rating) {
          // Add new rating to the beginning of the list
          state.userRatings = [action.payload.rating, ...state.userRatings];
          state.currentRating = action.payload.rating;
          // Update total count in pagination if it exists
          if (state.pagination) {
            state.pagination.total = (state.pagination.total || 0) + 1;
          }
        }
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "An unknown error occurred";
        state.actionSuccess = false;
      })

      // Get User Ratings
      .addCase(fetchUserRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.userRatings = action.payload?.ratings || [];
        state.pagination = action.payload?.pagination || {
          currentPage: 1,
          totalPages: 1,
          total: state.userRatings.length
        };
      })
      .addCase(fetchUserRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch ratings";
      })

      // Get Rating By ID
      .addCase(getRatingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRatingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRating = action.payload;
      })
      .addCase(getRatingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch rating";
        state.currentRating = null;
      })

      // Get Driver Ratings
      .addCase(fetchDriverRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverRatings.fulfilled, (state, action) => {
        state.loading = false;
        state.driverRatings = action.payload?.ratings || [];
        state.pagination = action.payload?.pagination || {
          currentPage: 1,
          totalPages: 1,
          total: state.driverRatings.length
        };
      })
      .addCase(fetchDriverRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch driver ratings";
      })

      // Get Driver Rating Summary
      .addCase(fetchDriverRatingSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverRatingSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.driverSummary = action.payload;
      })
      .addCase(fetchDriverRatingSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch driver rating summary";
        state.driverSummary = null;
      })

      // Moderate Rating
      .addCase(moderateRating.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(moderateRating.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.lastAction = Date.now();
        const moderatedRating = action.payload?.rating;

        if (moderatedRating?._id) {
          // Update or remove rating from all relevant state arrays
          if (moderatedRating.status === "active") {
            // Update rating in user ratings array
            state.userRatings = state.userRatings.map(rating =>
              rating._id === moderatedRating._id ? moderatedRating : rating
            );

            // Update rating in driver ratings array
            state.driverRatings = state.driverRatings.map(rating =>
              rating._id === moderatedRating._id ? moderatedRating : rating
            );
          } else {
            // Remove rating from user ratings array
            state.userRatings = state.userRatings.filter(rating =>
              rating._id !== moderatedRating._id
            );

            // Remove rating from driver ratings array
            state.driverRatings = state.driverRatings.filter(rating =>
              rating._id !== moderatedRating._id
            );

            // Update pagination total count
            if (state.pagination && state.pagination.total > 0) {
              state.pagination.total -= 1;
            }
          }

          // Update current rating if it matches the moderated rating
          if (state.currentRating?._id === moderatedRating._id) {
            state.currentRating = moderatedRating;
          }
        }
      })
      .addCase(moderateRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to moderate rating";
        state.actionSuccess = false;
      });
  }
});

export const { clearRatingError, resetRatingState, clearActionSuccess } = ratingSlice.actions;
export default ratingSlice.reducer;