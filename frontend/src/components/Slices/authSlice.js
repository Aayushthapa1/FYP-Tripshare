import {

  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import authService from "../../services/authService";


// Thunk for logging in a user
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (!response.IsSuccess) {
        return rejectWithValue(response.Error || "Login failed");
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

// Thunk for registering a user
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Registration failed");
    }
  }
);

// Thunk for checking authentication
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.checkAuth();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Authentication check failed");
    }
  }
);

// Thunk for logging out a user
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.logout();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Logout failed");
    }
  }
);

// Thunk for refreshing the access token
export const refreshAccessToken = createAsyncThunk(
  "auth/refresh_token",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshAccessTokenService();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to refresh token");
    }
  }
);

// Thunk for forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotpassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotpassword(email);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Forgot password failed");
    }
  }
);

// Thunk for resetting password
export const resetPassword = createAsyncThunk(
  "auth/resetpassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authService.resetpassword(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Reset password failed");
    }
  }
);


// Initial state
const initialState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  token: null,
};

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.isAuthenticated = false;
      state.isLoading = false;
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handling login user
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload.IsSuccess;
        state.user = action.payload.IsSuccess
          ? action.payload.Result?.user_data
          : null;
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      // Handling register user
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.isLoading = false;
        state.user = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      // Handling checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload.IsSuccess;
        state.user = action.payload.IsSuccess
          ? action.payload.Result?.user_data
          : null;
        state.isLoading = false;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })

      // Handling logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.isLoading = false;
        state.error = null;
      })

      // Handling refreshAccessToken
      .addCase(refreshAccessToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = true;
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Handling forgotPassword
    builder.addCase(forgotPassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(forgotPassword.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    })
    .addCase(forgotPassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Handling resetPassword
    builder.addCase(resetPassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(resetPassword.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    })
    .addCase(resetPassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload
    }
    );
    
  },
});



export default authSlice.reducer;
