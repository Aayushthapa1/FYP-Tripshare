import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userKYCService from "../../services/userKYCService"; // Make sure the import path is correct

const initialState = {
    users: [],
    pendingUsers: [],
    currentUser: null,
    loading: false,
    updateLoading: false,
    error: null,
    kycStatus: null,
    message: null,
};

// 1) **Submit User KYC (Personal Info Only)**
export const submitUserKYC = createAsyncThunk(
    "userKYC/submitUserKYC",
    async (formData, { rejectWithValue }) => {
        try {
            console.log("Dispatching submitUserKYC with formData");
            return await userKYCService.submitUserKYC(formData);
        } catch (error) {
            console.error("Error in submitUserKYC thunk:", error.message);
            return rejectWithValue(error.message);
        }
    }
);

// 2) **Get User KYC Status**
export const getUserKYCStatus = createAsyncThunk(
    "userKYC/getUserKYCStatus",
    async (userId, { rejectWithValue }) => {
        try {
            return await userKYCService.getUserKYCStatus(userId);
        } catch (error) {
            console.error(`Error getting KYC status for user ${userId}:`, error.message);
            return rejectWithValue(error.message);
        }
    }
);

// 3) **Fetch All Users with KYC (Admin)**
export const fetchAllUsersKYC = createAsyncThunk(
    "userKYC/fetchAllUsersKYC",
    async (_, { rejectWithValue }) => {
        try {
            const response = await userKYCService.getAllUsersKYC();
            return response.users || response; // Handle both response formats
        } catch (error) {
            console.error("Error fetching users KYC:", error.message);
            return rejectWithValue(error.message);
        }
    }
);

// 4) **Fetch Pending User KYC Requests (Admin)**
export const fetchPendingUserKYC = createAsyncThunk(
    "userKYC/fetchPendingUserKYC",
    async (_, { rejectWithValue }) => {
        try {
            const response = await userKYCService.getPendingUserKYC();
            return response.users || response; // Handle both response formats
        } catch (error) {
            console.error("Error fetching pending user KYC requests:", error.message);
            return rejectWithValue(error.message);
        }
    }
);

// 5) **Update User KYC Verification (Admin)**
export const updateUserKYCStatus = createAsyncThunk(
    "userKYC/updateUserKYCStatus",
    async ({ userId, status, rejectionReason }, { rejectWithValue }) => {
        try {
            return await userKYCService.updateUserKYCVerification(userId, status, rejectionReason);
        } catch (error) {
            console.error(`Error updating verification for user ${userId}:`, error.message);
            return rejectWithValue(error.message);
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
            state.currentUser = null;
            state.loading = false;
            state.updateLoading = false;
            state.error = null;
            state.kycStatus = null;
            state.message = null;
        }
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

                // Update in users array if exists
                const userIndex = state.users.findIndex((u) => u._id === user._id);
                if (userIndex >= 0) {
                    state.users[userIndex] = user;
                } else {
                    state.users.push(user);
                }

                state.currentUser = user;
                state.kycStatus = user.kycStatus || "pending";
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
                state.kycStatus = action.payload.kycStatus;
                if (action.payload.user) {
                    state.currentUser = action.payload.user;
                }
            })
            .addCase(getUserKYCStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.kycStatus = "not_submitted"; // Default if error
            })

            // 3) Fetch All Users KYC
            .addCase(fetchAllUsersKYC.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsersKYC.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.users || action.payload;
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
                state.pendingUsers = action.payload.users || action.payload;
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
                const status = action.payload.status || updatedUser.kycStatus;

                // Update in users array
                const userIndex = state.users.findIndex((u) => u._id === updatedUser._id);
                if (userIndex >= 0) {
                    state.users[userIndex] = updatedUser;
                }

                // Update in pendingUsers array
                const pendingIndex = state.pendingUsers.findIndex((u) => u._id === updatedUser._id);
                if (pendingIndex >= 0) {
                    // Remove from pending if verified or rejected
                    if (status === "verified" || status === "rejected") {
                        state.pendingUsers = state.pendingUsers.filter((u) => u._id !== updatedUser._id);
                    } else {
                        // Update in pending array
                        state.pendingUsers[pendingIndex] = updatedUser;
                    }
                }

                // Update currentUser if it's the same user
                if (state.currentUser && state.currentUser._id === updatedUser._id) {
                    state.currentUser = updatedUser;
                }

                state.message = `User KYC status updated to ${status}`;
            })
            .addCase(updateUserKYCStatus.rejected, (state, action) => {
                state.updateLoading = false;
                state.error = action.payload;
            });
    },
});

export const {
    clearUserKYCError,
    clearUserKYCMessage,
    setCurrentUser,
    clearCurrentUser,
    resetUserKYCState
} = userKYCSlice.actions;

export default userKYCSlice.reducer;
