// authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import authService from "../../services/authService";
import * as authService from "../../services/authService"; 

//  THUNK FOR LOGIN USER
// export const loginUser = createAsyncThunk(
//   "auth/login",
//   async (credentials, { rejectWithValue }) => {
//     try {
//       const response = await authService.login(credentials);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error || "Login failed");
//     }
//   }
// );

// THUNK FOR REGISTER USER
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error || "Registration failed");
    }
  }
);

// THUNK FOR CHECKING AUTHENTICATION
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      console.log("ENTERED THE CHECK AUTH");
      const response = await authService.checkAuth();
      console.log("The response in checkAuth is", response);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Authentication check failed"
      );
    }
  }
);

// THUNK FOR LOGOUT
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.logout();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Logout failed");
    }
  }
);

// THUNK FOR REFRESHING ACCESS TOKEN
export const refreshAccessToken = createAsyncThunk(
  "auth/refresh_token",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshAccessTokenService();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to refresh token"
      );
    }
  }
);

const initialState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.IsSuccess
          ? action.payload.Result?.user_data
          : null;
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.isLoading = false;
        state.user = null;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      // CHECK AUTH
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload.IsSuccess;
        state.user = action.payload.IsSuccess
          ? action.payload.Result?.user_data
          : null;
        state.isLoading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.isLoading = false;
      })

      // REFRESH ACCESS TOKEN
      .addCase(refreshAccessToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
