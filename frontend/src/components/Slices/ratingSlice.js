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

      // Call the service function to submit rating
      const result = await ratingService.submitRating({ 
        referenceId, 
        referenceType, 
        rating, 
        review, 
        categoryRatings 
      });
      return result;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 2) Get all ratings submitted by current user
export const fetchUserRatings = createAsyncThunk(
  "rating/getUserRatings",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      return await ratingService.getUserRatings(page, limit);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 3) Get a specific rating by ID
export const getRatingById = createAsyncThunk(
  "rating/getById",
  async (ratingId, { rejectWithValue }) => {
    try {
      return await ratingService.getRatingById(ratingId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 4) Update an existing rating
export const updateRating = createAsyncThunk(
  "rating/update",
  async ({ ratingId, rating, review, categoryRatings }, { rejectWithValue }) => {
    try {
      return await ratingService.updateRating(ratingId, { rating, review, categoryRatings });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 5) Delete a rating
export const deleteRating = createAsyncThunk(
  "rating/delete",
  async (ratingId, { rejectWithValue }) => {
    try {
      return await ratingService.deleteRating(ratingId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ===== DRIVER RATING ACTIONS =====
// 6) Get all ratings for a driver
export const fetchDriverRatings = createAsyncThunk(
  "rating/getDriverRatings",
  async ({ driverId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      return await ratingService.getDriverRatings(driverId, page, limit);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 7) Get rating summary for a driver
export const fetchDriverRatingSummary = createAsyncThunk(
  "rating/getDriverSummary",
  async (driverId, { rejectWithValue }) => {
    try {
      return await ratingService.getDriverRatingSummary(driverId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ===== ADMIN ACTIONS =====
// 8) Moderate a rating (admin only)
export const moderateRating = createAsyncThunk(
  "rating/moderate",
  async ({ ratingId, action, reason }, { rejectWithValue }) => {
    try {
      // Validate action
      if (!["flag", "remove", "restore"].includes(action)) {
        throw new Error("Invalid moderation action");
      }
      
      return await ratingService.moderateRating(ratingId, { action, reason });
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const ratingSlice = createSlice({
  name: "rating",
  initialState: {
    loading: false,
    error: null,
    userRatings: [],          // Ratings submitted by user
    driverRatings: [],        // Ratings for a specific driver
    currentRating: null,      // Single rating details
    driverSummary: null,      // Rating summary for a driver
    lastAction: null,         // Track last update time
    actionSuccess: false,     // Flag for successful actions
    pagination: {             // Pagination state
      currentPage: 1,
      totalPages: 1,
      total: 0
    }
  },
  reducers: {
    clearRatingError: (state) => {
      state.error = null;
    },
    resetRatingState: (state) => {
      state.loading = false;
      state.error = null;
      state.userRatings = [];
      state.driverRatings = [];
      state.currentRating = null;
      state.driverSummary = null;
      state.lastAction = null;
      state.actionSuccess = false;
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        total: 0
      };
    },
    clearActionSuccess: (state) => {
      state.actionSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // ==== SUBMIT RATING ====
      .addCase(submitRating.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(submitRating.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.lastAction = Date.now();
        
        // Add new rating to userRatings if it exists
        if (action.payload?.rating) {
          state.userRatings.unshift(action.payload.rating);
          state.currentRating = action.payload.rating;
        }
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.actionSuccess = false;
      })

      // ==== GET USER RATINGS ====
      .addCase(fetchUserRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRatings.fulfilled, (state, action) => {
        state.loading = false;
        
        // Extract ratings and pagination data
        state.userRatings = action.payload?.ratings || [];
        
        // Update pagination info
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchUserRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==== GET RATING BY ID ====
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
        state.error = action.payload;
      })

      // ==== UPDATE RATING ====
      .addCase(updateRating.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(updateRating.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.lastAction = Date.now();
        
        // Extract updated rating data
        const updatedRating = action.payload?.rating;
        
        if (updatedRating?._id) {
          // Update in userRatings array
          state.userRatings = state.userRatings.map(rating => 
            rating._id === updatedRating._id ? updatedRating : rating
          );
          
          // Update currentRating if it matches
          if (state.currentRating?._id === updatedRating._id) {
            state.currentRating = updatedRating;
          }
        }
      })
      .addCase(updateRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.actionSuccess = false;
      })

      // ==== DELETE RATING ====
      .addCase(deleteRating.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(deleteRating.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.lastAction = Date.now();
        
        // Remove from userRatings array if ID exists
        if (action.meta.arg) { // ratingId was passed in as arg
          const ratingId = action.meta.arg;
          state.userRatings = state.userRatings.filter(rating => 
            rating._id !== ratingId
          );
          
          // Clear currentRating if it matches
          if (state.currentRating?._id === ratingId) {
            state.currentRating = null;
          }
        }
      })
      .addCase(deleteRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.actionSuccess = false;
      })

      // ==== GET DRIVER RATINGS ====
      .addCase(fetchDriverRatings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverRatings.fulfilled, (state, action) => {
        state.loading = false;
        
        // Extract ratings and pagination data
        state.driverRatings = action.payload?.ratings || [];
        
        // Update pagination info
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchDriverRatings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==== GET DRIVER RATING SUMMARY ====
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
        state.error = action.payload;
      })

      // ==== MODERATE RATING (ADMIN) ====
      .addCase(moderateRating.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.actionSuccess = false;
      })
      .addCase(moderateRating.fulfilled, (state, action) => {
        state.loading = false;
        state.actionSuccess = true;
        state.lastAction = Date.now();
        
        // Extract moderated rating data
        const moderatedRating = action.payload?.rating;
        
        if (moderatedRating?._id) {
          // Update in relevant arrays based on rating status
          if (moderatedRating.status === "active") {
            // If restored, update in arrays
            state.userRatings = state.userRatings.map(rating => 
              rating._id === moderatedRating._id ? moderatedRating : rating
            );
            
            state.driverRatings = state.driverRatings.map(rating => 
              rating._id === moderatedRating._id ? moderatedRating : rating
            );
          } else {
            // If flagged or removed, filter out from arrays
            state.userRatings = state.userRatings.filter(rating => 
              rating._id !== moderatedRating._id
            );
            
            state.driverRatings = state.driverRatings.filter(rating => 
              rating._id !== moderatedRating._id
            );
          }
          
          // Update currentRating if it matches
          if (state.currentRating?._id === moderatedRating._id) {
            state.currentRating = moderatedRating;
          }
        }
      })
      .addCase(moderateRating.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.actionSuccess = false;
      });
  }
});

export const { clearRatingError, resetRatingState, clearActionSuccess } = ratingSlice.actions;
export default ratingSlice.reducer;