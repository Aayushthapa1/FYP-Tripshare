import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import driverKYCService from "../../services/driverKYCService"; // Adjust path if needed

// Initial state now includes verifiedDrivers and kycRejectionReason
const initialState = {
  drivers: [],
  pendingDrivers: [],
  verifiedDrivers: [],
  currentDriver: null,
  loading: false,
  updateLoading: false,
  error: null,
  kycStatus: null,
  kycRejectionReason: null,  // <-- NEW
  message: null,
};

// 1) Submit Driver KYC
export const submitDriverKYC = createAsyncThunk(
  "driverKYC/submitDriverKYC",
  async (formData, { rejectWithValue }) => {
    try {
      return await driverKYCService.submitDriverKYC(formData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2) Get Driver KYC Status
export const getDriverKYCStatus = createAsyncThunk(
  "driverKYC/getDriverKYCStatus",
  async (userId, { rejectWithValue }) => {
    try {
      return await driverKYCService.getDriverKYCStatus(userId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 3) Fetch All Drivers KYC (Admin)
export const fetchAllDriversKYC = createAsyncThunk(
  "driverKYC/fetchAllDriversKYC",
  async (_, { rejectWithValue }) => {
    try {
      const response = await driverKYCService.getAllDriversKYC();
      // The backend returns { success: true, drivers: [...] }
      return response.drivers || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 4) Fetch Pending Driver KYC Requests (Admin)
export const fetchPendingDriverKYC = createAsyncThunk(
  "driverKYC/fetchPendingDriverKYC",
  async (_, { rejectWithValue }) => {
    try {
      const response = await driverKYCService.getPendingDriverKYC();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 5) Update Driver KYC Status (Admin)
export const updateDriverKYCStatus = createAsyncThunk(
  "driverKYC/updateDriverKYCStatus",
  async ({ userId, status, rejectionReason }, { rejectWithValue }) => {
    try {
      return await driverKYCService.updateDriverKYCVerification(
        userId,
        status,
        rejectionReason
      );
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 6) Fetch Verified Drivers KYC (Admin)
export const fetchVerifiedDriverKYC = createAsyncThunk(
  "driverKYC/fetchVerifiedDriverKYC",
  async (_, { rejectWithValue }) => {
    try {
      const response = await driverKYCService.getVerifiedDriverKYC();
      return response.drivers || response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Get Driver KYC details
export const getDriverKYCDetails = createAsyncThunk(
  'driverKYC/getDriverKYCDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_URL}/driverkyc/details/${userId}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch driver KYC details'
      );
    }
  }
);

const driverKYCSlice = createSlice({
  name: "driverKYC",
  initialState,
  reducers: {
    clearDriverKYCError: (state) => {
      state.error = null;
    },
    clearDriverKYCMessage: (state) => {
      state.message = null;
    },
    setCurrentDriver: (state, action) => {
      state.currentDriver = action.payload;
    },
    clearCurrentDriver: (state) => {
      state.currentDriver = null;
    },
    resetDriverKYCState: (state) => {
      state.drivers = [];
      state.pendingDrivers = [];
      state.verifiedDrivers = [];
      state.currentDriver = null;
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
      // 1) Submit Driver KYC
      .addCase(submitDriverKYC.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(submitDriverKYC.fulfilled, (state, action) => {
        state.loading = false;
        const user = action.payload.user || action.payload;

        // Update or add driver in 'drivers' array
        const idx = state.drivers.findIndex((d) => d._id === user._id);
        if (idx >= 0) {
          state.drivers[idx] = user;
        } else {
          state.drivers.push(user);
        }

        // Also set as currentDriver
        state.currentDriver = user;
        state.kycStatus = user.kycStatus || "pending";
        // If the driver is re-submitting after rejection,
        // they might have had a rejection reason before;
        // now it should be cleared.
        state.kycRejectionReason = null;
        state.message = "Driver KYC information submitted successfully";
      })
      .addCase(submitDriverKYC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 2) Get Driver KYC Status
      .addCase(getDriverKYCStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDriverKYCStatus.fulfilled, (state, action) => {
        state.loading = false;
        // The response typically has shape: { success, kycStatus, kycRejectionReason, user }
        const { kycStatus, kycRejectionReason, user } = action.payload;
        state.kycStatus = kycStatus;
        state.kycRejectionReason = kycRejectionReason || null;

        if (user) {
          // Update or add driver in 'drivers' array
          const idx = state.drivers.findIndex((d) => d._id === user._id);
          if (idx >= 0) {
            state.drivers[idx] = user;
          } else {
            state.drivers.push(user);
          }
          // Set as current driver
          state.currentDriver = user;
        }
      })
      .addCase(getDriverKYCStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // If we got an error, we might default to not_submitted
        state.kycStatus = "not_submitted";
        state.kycRejectionReason = null;
      })

      // 3) Fetch All Drivers KYC
      .addCase(fetchAllDriversKYC.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDriversKYC.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload; // e.g. array of driver objects
      })
      .addCase(fetchAllDriversKYC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 4) Fetch Pending Driver KYC
      .addCase(fetchPendingDriverKYC.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingDriverKYC.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingDrivers = action.payload.drivers; // array of driver objects
      })
      .addCase(fetchPendingDriverKYC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 5) Update Driver KYC Status
      .addCase(updateDriverKYCStatus.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateDriverKYCStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedUser = action.payload.user || action.payload;
        const newStatus = updatedUser.kycStatus;

        // Update driver in the 'drivers' array
        const idx = state.drivers.findIndex((d) => d._id === updatedUser._id);
        if (idx >= 0) {
          state.drivers[idx] = updatedUser;
        }

        // Update driver in the 'pendingDrivers' array if needed
        const pIdx = state.pendingDrivers.findIndex((d) => d._id === updatedUser._id);
        if (pIdx >= 0) {
          // If the admin verified or rejected, remove from pending
          if (newStatus === "verified" || newStatus === "rejected") {
            state.pendingDrivers.splice(pIdx, 1);
          } else {
            state.pendingDrivers[pIdx] = updatedUser;
          }
        }

        // Update currentDriver if it matches
        if (state.currentDriver && state.currentDriver._id === updatedUser._id) {
          state.currentDriver = updatedUser;
          state.kycStatus = newStatus;
          // If status = rejected, store the reason
          state.kycRejectionReason = updatedUser.kycRejectionReason || null;
        }

        state.message = `Driver KYC status updated to ${newStatus}`;
      })
      .addCase(updateDriverKYCStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // 6) Fetch Verified Driver KYC
      .addCase(fetchVerifiedDriverKYC.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVerifiedDriverKYC.fulfilled, (state, action) => {
        state.loading = false;
        // array of verified driver objects
        state.verifiedDrivers = action.payload;
      })
      .addCase(fetchVerifiedDriverKYC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearDriverKYCError,
  clearDriverKYCMessage,
  setCurrentDriver,
  clearCurrentDriver,
  resetDriverKYCState,
} = driverKYCSlice.actions;

export default driverKYCSlice.reducer;