import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import authService from "../../services/authService"

// Async thunks for login, signup, and logout

//  THUNK FOR LOGIN USER
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      console.log("Login thunk executing with:", credentials.email);
      const response = await authService.login(credentials);
      console.log("Login thunk response:", response);

      // Check if the response has the expected structure
      if (!response) {
        return rejectWithValue("No response from server");
      }

      return response;
    } catch (error) {
      console.error("Login thunk error:", error);
      return rejectWithValue(error || "Login failed");
    }
  }
);

// THUNK FOR REGISTER USER
export const registerUser = createAsyncThunk("auth/register", async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.register(userData)
    return response
  } catch (error) {
    return rejectWithValue(error || "Registration failed")
  }
})

// THUNK FOR CHECKING AUTHENTICATION
export const checkAuth = createAsyncThunk("auth/checkAuth", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.checkAuth()
    return response
  } catch (error) {
    return rejectWithValue(error.response?.data || "Authentication check failed")
  }
})

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.logout()
    return response
  } catch (error) {
    return rejectWithValue(error.response?.data || "Logout failed")
  }
})

export const refreshAccessToken = createAsyncThunk("auth/refresh_token", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.refreshAccessTokenService()
    return response
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to refresh token")
  }
})

// Thunk for forgot password
export const forgotPassword = createAsyncThunk("auth/forgotpassword", async (email, { rejectWithValue }) => {
  try {
    const response = await authService.forgotpassword(email)
    return response
  } catch (error) {
    return rejectWithValue(error.message || "Forgot password failed")
  }
})

// Thunk for resetting password
export const resetPassword = createAsyncThunk("auth/resetpassword", async (data, { rejectWithValue }) => {
  try {
    const response = await authService.resetpassword(data)
    return response
  } catch (error) {
    return rejectWithValue(error.message || "Reset password failed")
  }
})

// Initial state
const initialState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
}

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.isAuthenticated = false
      state.isLoading = false
      state.user = null
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Handling login user
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log("Login fulfilled with payload:", action.payload);

        // Handle different response structures
        if (action.payload.IsSuccess) {
          state.isAuthenticated = true;
          state.user = action.payload.Result?.user_data || null;
        } else if (action.payload.token) {
          // Alternative response structure with token
          state.isAuthenticated = true;
          state.user = action.payload.user || null;
        } else {
          state.isAuthenticated = false;
          state.error = action.payload.ErrorMessage || action.payload.message || "Login failed";
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload || action.error.message || "Login failed";
      })

      // Handling register user
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isAuthenticated = false
        state.isLoading = false
        state.user = null
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.error = action.payload || action.error.message || "Registration failed"
      })

      // Handling checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = action.payload.IsSuccess
        state.user = action.payload.IsSuccess ? action.payload.Result?.user_data : null
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.error = action.payload || action.error.message || "Authentication check failed"
      })

      // Handling logoutUser
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.isLoading = false
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message || "Logout failed"
      })

      // Handling refreshAccessToken
      .addCase(refreshAccessToken.pending, (state) => {
        state.isLoading = true
      })
      .addCase(refreshAccessToken.fulfilled, (state) => {
        state.isLoading = false
        state.isAuthenticated = true
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message || "Failed to refresh token"
      })

      // Handling forgotPassword
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message || "Forgot password failed"
      })

      // Handling resetPassword
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message || "Reset password failed"
      })
  },
})

export const { resetAuthState, clearError } = authSlice.actions
export default authSlice.reducer