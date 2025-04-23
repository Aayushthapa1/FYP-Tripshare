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

      // Save user to localStorage on successful login
      if (response.success || response.Result || response.token) {
        const userData = response.Result?.user_data || response.user || null;
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
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
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      console.log("ENTERED THE CHECK AUTH ");
      const response = await authService.checkAuth();
      console.log("The resposne in the check auth is", response);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Authentication check failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.logout()
    // Clear user data from localStorage
    localStorage.removeItem('user');
    return response
  } catch (error) {
    // Still clear localStorage even if the API call fails
    localStorage.removeItem('user');
    return rejectWithValue(error.message || "Logout failed")
  }
})

export const refreshAccessToken = createAsyncThunk("auth/refresh_token", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.refreshAccessTokenService()
    // If token refresh is successful, make sure user data is still saved
    if (response.success && response.result?.user_data) {
      localStorage.setItem('user', JSON.stringify(response.result.user_data));
    }
    return response
  } catch (error) {
    return rejectWithValue(error.message || "Failed to refresh token")
  }
})

// Updated thunk for forgot password - fixed service method name
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.forgotPassword(email)
      return response
    } catch (error) {
      return rejectWithValue(error.message || "Forgot password failed")
    }
  }
)

// Updated thunk for resetting password - fixed service method name
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(data)
      return response
    } catch (error) {
      return rejectWithValue(error.message || "Reset password failed")
    }
  }
)

// Initialize state from localStorage if available
const getUserFromStorage = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error parsing stored user:", error);
    return null;
  }
};

// Initial state with password reset states and stored user
const initialState = {
  isAuthenticated: !!localStorage.getItem('user'), // Initialize based on localStorage
  isLoading: false,
  user: getUserFromStorage(),
  error: null,
  passwordResetStatus: null,
  passwordResetMessage: null
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
      state.passwordResetStatus = null
      state.passwordResetMessage = null
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null
    },
    clearPasswordResetStatus: (state) => {
      state.passwordResetStatus = null
      state.passwordResetMessage = null
    }
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
        if (action.payload.success || action.payload.Result) {
          state.isAuthenticated = true;
          state.user = action.payload.Result?.user_data || action.payload.user || null;

          // Ensure user data is stored in localStorage
          if (state.user) {
            localStorage.setItem('user', JSON.stringify(state.user));
          }
        } else if (action.payload.token) {
          // Alternative response structure with token
          state.isAuthenticated = true;
          state.user = action.payload.user || null;

          // Ensure user data is stored in localStorage
          if (state.user) {
            localStorage.setItem('user', JSON.stringify(state.user));
          }
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
        state.isLoading = true;
        // Don't clear isAuthenticated or user here to maintain state during check
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Make sure we have valid payload and handle correctly
        if (action.payload && typeof action.payload.success === 'boolean') {
          state.isAuthenticated = action.payload.success;
          
          if (action.payload.success && action.payload.result?.user_data) {
            state.user = action.payload.result.user_data;
            
            // Store in localStorage as fallback if using cookies
            localStorage.setItem('user', JSON.stringify(state.user));
          } else if (!action.payload.success) {
            state.user = null;
          }
        } else {
          // Handle malformed response
          console.error("Malformed response in checkAuth.fulfilled:", action.payload);
        }
        
        state.error = null;
        
        // Debug
        console.log("Auth state after fulfilled:", { 
          isAuthenticated: state.isAuthenticated, 
          user: state.user ? `User ID: ${state.user._id}` : null 
        });
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        
        // Don't clear authentication state on rejection if you want fallback
        // Only set the error message
        state.error = action.payload || action.error.message || "Authentication check failed";
        
        // Debug
        console.log("Auth check rejected with error:", state.error);
      })

      // Handling logoutUser
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.isLoading = false
        // User data is already removed from localStorage in the thunk
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Still logout on the client side even if API call fails
        state.isAuthenticated = false
        state.user = null
        state.isLoading = false
        state.error = action.payload || action.error.message || "Logout failed"
        // User data is already removed from localStorage in the thunk
      })

      // Handling refreshAccessToken
      .addCase(refreshAccessToken.pending, (state) => {
        state.isLoading = true
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.isLoading = false
        // Only update auth state if the refresh was successful
        if (action.payload.success) {
          state.isAuthenticated = true
          // If user data is included in the response, update it
          if (action.payload.result?.user_data) {
            state.user = action.payload.result.user_data
            localStorage.setItem('user', JSON.stringify(state.user));
          }
        }
      })
      .addCase(refreshAccessToken.rejected, (state, action) => {
        state.isLoading = false
        // Don't change auth state here to avoid sudden logouts
        state.error = action.payload || action.error.message || "Failed to refresh token"
      })

      // Improved handling for forgotPassword
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.passwordResetStatus = "pending"
        state.passwordResetMessage = null
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.passwordResetStatus = "success"
        state.passwordResetMessage = action.payload?.result?.message || "Password reset link sent to your email"
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.passwordResetStatus = "failed"
        state.error = action.payload || action.error.message || "Forgot password failed"
        state.passwordResetMessage = action.payload || action.error.message || "Failed to send password reset link"
      })

      // Improved handling for resetPassword
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.passwordResetStatus = "pending"
        state.passwordResetMessage = null
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
        state.passwordResetStatus = "success"
        state.passwordResetMessage = action.payload?.result?.message || "Password reset successful"
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.passwordResetStatus = "failed"
        state.error = action.payload || action.error.message || "Reset password failed"
        state.passwordResetMessage = action.payload || action.error.message || "Failed to reset password"
      })
  },
})

export const { resetAuthState, clearError, clearPasswordResetStatus } = authSlice.actions
export default authSlice.reducer