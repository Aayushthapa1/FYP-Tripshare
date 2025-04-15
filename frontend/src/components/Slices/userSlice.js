// userSlice.js - Updated
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
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllUsersService();
      console.log("Data from service:", data); // For debugging

      // Ensure we have an array, even if the service returns something else
      if (!Array.isArray(data)) {
        console.warn("Service didn't return an array, converting:", data);
        return data ? (Array.isArray(data) ? data : []) : [];
      }

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
    loading: false,
    error: null,
  },
  reducers: {
    // Add any synchronous reducers here if needed
    clearUsers: (state) => {
      state.users = [];
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
        state.users = action.payload || []; // Ensure we always have an array
        console.log("Users saved to state:", state.users); // For debugging
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