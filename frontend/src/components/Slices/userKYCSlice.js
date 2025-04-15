import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userKYCService from "../../services/userKYCService"; // Adjust path if needed

// Initial state now includes verifiedUsers and kycRejectionReason
const initialState = {
    users: [],
    pendingUsers: [],
    verifiedUsers: [],
    currentUser: null,
    loading: false,
    updateLoading: false,
    error: null,
    kycStatus: null,
    kycRejectionReason: null,  // <-- NEW
    message: null,
};

// 1) Submit User KYC
export const submitUserKYC = createAsyncThunk(
    "userKYC/submitUserKYC",
    async (formData, { rejectWithValue }) => {
        try {
            return await userKYCService.submitUserKYC(formData);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 2) Get User KYC Status
export const getUserKYCStatus = createAsyncThunk(
    "userKYC/getUserKYCStatus",
    async (userId, { rejectWithValue }) => {
        try {
            return await userKYCService.getUserKYCStatus(userId);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 3) Fetch All Users KYC (Admin)
export const fetchAllUsersKYC = createAsyncThunk(
    "userKYC/fetchAllUsersKYC",
    async (_, { rejectWithValue }) => {
        try {
            const response = await userKYCService.getAllUsersKYC();
            // The backend returns { success: true, users: [...] }
            return response.users || response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 4) Fetch Pending User KYC Requests (Admin)
export const fetchPendingUserKYC = createAsyncThunk(
    "userKYC/fetchPendingUserKYC",
    async (_, { rejectWithValue }) => {
        try {
            const response = await userKYCService.getPendingUserKYC();
            return response.users || response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 5) Update User KYC Status (Admin)
export const updateUserKYCStatus = createAsyncThunk(
    "userKYC/updateUserKYCStatus",
    async ({ userId, status, rejectionReason }, { rejectWithValue }) => {
        try {
            return await userKYCService.updateUserKYCVerification(
                userId,
                status,
                rejectionReason
            );
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 6) Fetch Verified Users KYC (Admin)
export const fetchVerifiedUserKYC = createAsyncThunk(
    "userKYC/fetchVerifiedUserKYC",
    async (_, { rejectWithValue }) => {
        try {
            const response = await userKYCService.getVerifiedUserKYC();
            return response.users || response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Get KYC details
export const getUserKYCDetails = createAsyncThunk(
    'userKYC/getUserKYCDetails',
    async (userId, { rejectWithValue }) => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const response = await axios.get(`${API_URL}/kyc/details/${userId}`, config);
        return response.data;
      } catch (error) {
        return rejectWithValue(
          error.response?.data?.message || 'Failed to fetch KYC details'
        );
      }
    }
  );
  
const userKYCSlice = createSlice({
    name: "userKYC",
    initialState,
    reducers: {
        clearUserKYCError: (state) => {
            state.error = null;
        },
        clearUserKYCMessage: (state) => {
            state.message = null;
        },
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
        },
        clearCurrentUser: (state) => {
            state.currentUser = null;
        },
        resetUserKYCState: (state) => {
            state.users = [];
            state.pendingUsers = [];
            state.verifiedUsers = [];
            state.currentUser = null;
            state.loading = false;
            state.updateLoading = false;
            state.error = null;
            state.kycStatus = null;
            state.kycRejectionReason = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // 1) Submit User KYC
            .addCase(submitUserKYC.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(submitUserKYC.fulfilled, (state, action) => {
                state.loading = false;
                const user = action.payload.user || action.payload;

                // Update or add user in 'users' array
                const idx = state.users.findIndex((u) => u._id === user._id);
                if (idx >= 0) {
                    state.users[idx] = user;
                } else {
                    state.users.push(user);
                }

                // Also set as currentUser
                state.currentUser = user;
                state.kycStatus = user.kycStatus || "pending";
                // If the user is re-submitting after rejection,
                // they might have had a rejection reason before;
                // now it should be cleared.
                state.kycRejectionReason = null;
                state.message = "KYC information submitted successfully";
            })
            .addCase(submitUserKYC.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 2) Get User KYC Status
            .addCase(getUserKYCStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserKYCStatus.fulfilled, (state, action) => {
                state.loading = false;
                // The response typically has shape: { success, kycStatus, kycRejectionReason, user }
                const { kycStatus, kycRejectionReason, user } = action.payload;
                state.kycStatus = kycStatus;
                state.kycRejectionReason = kycRejectionReason || null;

                if (user) {
                    // Update or add user in 'users' array
                    const idx = state.users.findIndex((u) => u._id === user._id);
                    if (idx >= 0) {
                        state.users[idx] = user;
                    } else {
                        state.users.push(user);
                    }
                    // Set as current user
                    state.currentUser = user;
                }
            })
            .addCase(getUserKYCStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                // If we got an error, we might default to not_submitted
                state.kycStatus = "not_submitted";
                state.kycRejectionReason = null;
            })

            // 3) Fetch All Users KYC
            .addCase(fetchAllUsersKYC.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsersKYC.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload; // e.g. array of user objects
            })
            .addCase(fetchAllUsersKYC.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 4) Fetch Pending User KYC
            .addCase(fetchPendingUserKYC.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPendingUserKYC.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingUsers = action.payload; // array of user objects
            })
            .addCase(fetchPendingUserKYC.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 5) Update User KYC Status
            .addCase(updateUserKYCStatus.pending, (state) => {
                state.updateLoading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(updateUserKYCStatus.fulfilled, (state, action) => {
                state.updateLoading = false;
                const updatedUser = action.payload.user || action.payload;
                const newStatus = updatedUser.kycStatus;

                // Update user in the 'users' array
                const idx = state.users.findIndex((u) => u._id === updatedUser._id);
                if (idx >= 0) {
                    state.users[idx] = updatedUser;
                }

                // Update user in the 'pendingUsers' array if needed
                const pIdx = state.pendingUsers.findIndex((u) => u._id === updatedUser._id);
                if (pIdx >= 0) {
                    // If the admin verified or rejected, remove from pending
                    if (newStatus === "verified" || newStatus === "rejected") {
                        state.pendingUsers.splice(pIdx, 1);
                    } else {
                        state.pendingUsers[pIdx] = updatedUser;
                    }
                }

                // Update currentUser if it matches
                if (state.currentUser && state.currentUser._id === updatedUser._id) {
                    state.currentUser = updatedUser;
                    state.kycStatus = newStatus;
                    // If status = rejected, store the reason
                    state.kycRejectionReason = updatedUser.kycRejectionReason || null;
                }

                state.message = `User KYC status updated to ${newStatus}`;
            })
            .addCase(updateUserKYCStatus.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            })

            // 6) Fetch Verified User KYC
            .addCase(fetchVerifiedUserKYC.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVerifiedUserKYC.fulfilled, (state, action) => {
                state.loading = false;
                // array of verified user objects
                state.verifiedUsers = action.payload;
            })
            .addCase(fetchVerifiedUserKYC.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearUserKYCError,
    clearUserKYCMessage,
    setCurrentUser,
    clearCurrentUser,
    resetUserKYCState,
} = userKYCSlice.actions;

export default userKYCSlice.reducer;
