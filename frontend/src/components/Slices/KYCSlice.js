import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import driverService from "../../services/KYCService";

const initialState = {
  drivers: [],
  pendingDrivers: [],
  currentDriver: null,
  loading: false,
  error: null,
};

// 1) **Save Personal Info**
export const savePersonalInfo = createAsyncThunk(
  "driver/savePersonalInfo",
  async (formData, { rejectWithValue }) => {
    try {
      return await driverService.savePersonalInfo(formData);
    } catch (error) {
      console.error("Error saving personal info:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// 2) **Save License Info**
export const saveLicenseInfo = createAsyncThunk(
  "driver/saveLicenseInfo",
  async ({ driverId, formData }, { rejectWithValue }) => {
    try {
      return await driverService.saveLicenseInfo(driverId, formData);
    } catch (error) {
      console.error("Error saving license info:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// 3) **Save Vehicle Info**
export const saveVehicleInfo = createAsyncThunk(
  "driver/saveVehicleInfo",
  async ({ driverId, formData }, { rejectWithValue }) => {
    try {
      return await driverService.saveVehicleInfo(driverId, formData);
    } catch (error) {
      console.error("Error saving vehicle info:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// 4) **Fetch All Drivers**
export const fetchAllDrivers = createAsyncThunk(
  "driver/fetchAllDrivers",
  async (_, { rejectWithValue }) => {
    try {
      return await driverService.getAllDrivers();
    } catch (error) {
      console.error("Error fetching drivers:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// 5) **Fetch Driver by ID**
export const fetchDriverById = createAsyncThunk(
  "driver/fetchDriverById",
  async (driverId, { rejectWithValue }) => {
    try {
      return await driverService.getDriverById(driverId);
    } catch (error) {
      console.error(`Error fetching driver ${driverId}:`, error.message);
      return rejectWithValue(error.message);
    }
  }
);

// 6) **Update Verification (Verify or Reject)**
export const updateDriverVerification = createAsyncThunk(
  "driver/updateDriverVerification",
  async ({ driverId, status, rejectionReason }, { rejectWithValue }) => {
    try {
      const result = await driverService.updateDriverVerification(driverId, status, rejectionReason)
      return result
    } catch (error) {
      console.error(`Error updating verification for driver ${driverId}:`, error.message)
      return rejectWithValue(error.message)
    }
  },
)

// 7) **Submit KYC**
export const submitKYC = createAsyncThunk(
  "driver/submitKYC",
  async ({ userId, kycData }, { rejectWithValue }) => {
    try {
      return await driverService.submitKYC(userId, kycData);
    } catch (error) {
      console.error("Error submitting KYC:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// 8) **Fetch Pending KYC Requests**
export const fetchPendingKYC = createAsyncThunk(
  "driver/fetchPendingKYC",
  async (_, { rejectWithValue }) => {
    try {
      return await driverService.getPendingKYC();
    } catch (error) {
      console.error("Error fetching pending KYC requests:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// 9) **Reject a Driver**
export const rejectDriver = createAsyncThunk(
  "driver/rejectDriver",
  async ({ driverId, reason }, { rejectWithValue }) => {
    try {
      return await driverService.rejectDriver(driverId, reason);
    } catch (error) {
      console.error(`Error rejecting driver ${driverId}:`, error.message);
      return rejectWithValue(error.message);
    }
  }
);

// 10) **Verify a Driver**
export const verifyDriver = createAsyncThunk(
  "driver/verifyDriver",
  async (driverId, { rejectWithValue }) => {
    try {
      return await driverService.verifyDriver(driverId);
    } catch (error) {
      console.error(`Error verifying driver ${driverId}:`, error.message);
      return rejectWithValue(error.message);
    }
  }
);

const KYCSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    clearDriverError: (state) => {
      state.error = null;
    },
    setCurrentDriver: (state, action) => {
      state.currentDriver = action.payload;
    },
    clearCurrentDriver: (state) => {
      state.currentDriver = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1) Save Personal Info
      .addCase(savePersonalInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(savePersonalInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers.push(action.payload);
      })
      .addCase(savePersonalInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 2) Save License Info
      .addCase(saveLicenseInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveLicenseInfo.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(saveLicenseInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 3) Save Vehicle Info
      .addCase(saveVehicleInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveVehicleInfo.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(saveVehicleInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 4) Fetch All Drivers
      .addCase(fetchAllDrivers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload;
      })
      .addCase(fetchAllDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 5) Fetch Pending KYC Requests
      .addCase(fetchPendingKYC.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingKYC.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingDrivers = action.payload;
      })
      .addCase(fetchPendingKYC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 6) Update Verification
      .addCase(updateDriverVerification.pending, (state) => {
        state.updateLoading = true
        state.updateError = null
      })
      .addCase(updateDriverVerification.fulfilled, (state, action) => {
        state.updateLoading = false
        // Update the driver in the pendingDrivers array
        const updatedDriver = action.payload.driver
        const index = state.pendingDrivers.findIndex((driver) => driver._id === updatedDriver._id)
        if (index !== -1) {
          state.pendingDrivers[index] = updatedDriver
        }
      })
      .addCase(updateDriverVerification.rejected, (state, action) => {
        state.updateLoading = false
        state.updateError = action.payload;
      })



      // 7) Submit KYC
      .addCase(submitKYC.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitKYC.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers.push(action.payload);
      })
      .addCase(submitKYC.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // 8) Reject a Driver

      .addCase(rejectDriver.pending, (state) => {
        state.loading = true;
      }
      )
      .addCase(rejectDriver.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(rejectDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


      // 9) Verify a Driver

      .addCase(verifyDriver.pending, (state) => {
        state.loading = true;
      }
      )
      .addCase(verifyDriver.fulfilled, (state, action) => {
        state.loading = false;
      })

      .addCase(verifyDriver.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }
      )

      // 10) Fetch Driver by ID

      .addCase(fetchDriverById.pending, (state) => {
        state.loading = true;
      }
      )
      .addCase(fetchDriverById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDriver = action.payload;
      })
      .addCase(fetchDriverById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload
      }
      )
      ;
  }
});


export const { clearDriverError, setCurrentDriver, clearCurrentDriver } = KYCSlice.actions;
export default KYCSlice.reducer;

