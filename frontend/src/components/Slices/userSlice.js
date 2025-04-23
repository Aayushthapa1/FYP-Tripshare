import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserProfile, updateUserProfile, getAllUsersService } from '../../services/userService.js';

export const getUserProfile = createAsyncThunk(
  'user/getUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await fetchUserProfile(userId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfileAction = createAsyncThunk(
  'user/updateUserProfile',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const data = await updateUserProfile(userId, userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllUsers = createAsyncThunk(
  "user/fetchAllUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await getAllUsersService(params);
      console.log("Data from service:", data);

      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return rejectWithValue(error.message || "Failed to fetch users");
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    users: [],
    userData: null,
    userStats: null,
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUsers: (state) => {
      state.users = [];
      state.userStats = null;
      state.pagination = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserProfileAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfileAction.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
      })
      .addCase(updateUserProfileAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;

        // Handle the new response structure
        if (action.payload && action.payload.users_data) {
          state.users = action.payload.users_data || [];
          state.userStats = action.payload.stats || null;
          state.pagination = action.payload.pagination || null;
        } else {
          // Fallback if we don't get the expected structure
          state.users = Array.isArray(action.payload) ? action.payload : [];
        }

        console.log("Users saved to state:", state.users);
        console.log("User stats saved:", state.userStats);
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Error in fetchAllUsers:", action.payload);
      });
  },
});

export const { clearUsers } = userSlice.actions;
export default userSlice.reducer;