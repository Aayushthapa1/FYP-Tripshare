

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
      const data = await getAllUsersService(); // an array
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
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
  reducers: {},
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
        // `action.payload` is the array from getAllUsersService
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    ;
  },
});

export default userSlice.reducer;