import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import driverService from '../../services/driverService';

const initialState = {
  drivers: [],
  currentDriver: null,
  loading: false,
  error: null,
  kycLoading: false,
  kycError: null,
  verificationLoading: false,
  kycData: [],
};

// Thunks
export const createDriverPersonalInfo = createAsyncThunk(
  'driver/createPersonal',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await driverService.savePersonalInfo(formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to save personal information' });
    }
  }
);

export const updateDriverLicense = createAsyncThunk(
  'driver/updateLicense',
  async ({ driverId, formData }, { rejectWithValue }) => {
    try {
      const response = await driverService.saveLicenseInfo(driverId, formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to save license information' });
    }
  }
);

export const updateDriverVehicle = createAsyncThunk(
  'driver/updateVehicle',
  async ({ driverId, formData }, { rejectWithValue }) => {
    try {
      const response = await driverService.saveVehicleInfo(driverId, formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to save vehicle information' });
    }
  }
);

export const fetchAllDrivers = createAsyncThunk(
  'driver/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await driverService.getAllDrivers();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch drivers' });
    }
  }
);

export const fetchDriverById = createAsyncThunk(
  'driver/fetchById',
  async (driverId, { rejectWithValue }) => {
    try {
      const response = await driverService.getDriverById(driverId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch driver' });
    }
  }
);

export const updateDriverVerification = createAsyncThunk(
  'driver/updateVerification',
  async ({ driverId, isVerified }, { rejectWithValue }) => {
    try {
      const response = await driverService.updateVerification(driverId, isVerified);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update verification status' });
    }
  }
);

export const submitDriverKYC = createAsyncThunk(
  'driver/submitKYC',
  async ({ userId, kycData }, { rejectWithValue }) => {
    try {
      const response = await driverService.submitKYC(userId, kycData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to submit KYC' });
    }
  }
);

export const fetchKYCData = createAsyncThunk(
  'driver/fetchKYCData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await driverService.getPendingKYC();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch KYC data' });
    }
  }
);

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    clearDriverError: (state) => {
      state.error = null;
      state.kycError = null;
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
      // Create Personal Info
      .addCase(createDriverPersonalInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDriverPersonalInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers.push(action.payload);
        state.currentDriver = action.payload;
      })
      .addCase(createDriverPersonalInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to save personal information';
      })

      // Update License
      .addCase(updateDriverLicense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDriverLicense.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = state.drivers.map(driver =>
          driver._id === action.payload._id ? action.payload : driver
        );
        if (state.currentDriver && state.currentDriver._id === action.payload._id) {
          state.currentDriver = action.payload;
        }
      })
      .addCase(updateDriverLicense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update license information';
      })

      // Update Vehicle
      .addCase(updateDriverVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDriverVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = state.drivers.map(driver =>
          driver._id === action.payload._id ? action.payload : driver
        );
        if (state.currentDriver && state.currentDriver._id === action.payload._id) {
          state.currentDriver = action.payload;
        }
      })
      .addCase(updateDriverVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update vehicle information';
      })

      // Fetch All Drivers
      .addCase(fetchAllDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.drivers = action.payload;
      })
      .addCase(fetchAllDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch drivers';
      })

      // Fetch Driver by ID
      .addCase(fetchDriverById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDriverById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDriver = action.payload;
        
        // Update in drivers array if exists
        const existingIndex = state.drivers.findIndex(driver => driver._id === action.payload._id);
        if (existingIndex >= 0) {
          state.drivers[existingIndex] = action.payload;
        } else {
          state.drivers.push(action.payload);
        }
      })
      .addCase(fetchDriverById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch driver';
      })

      // Update Verification
      .addCase(updateDriverVerification.pending, (state) => {
        state.verificationLoading = true;
        state.error = null;
      })
      .addCase(updateDriverVerification.fulfilled, (state, action) => {
        state.verificationLoading = false;
        state.drivers = state.drivers.map(driver =>
          driver._id === action.payload._id ? action.payload : driver
        );
        if (state.currentDriver && state.currentDriver._id === action.payload._id) {
          state.currentDriver = action.payload;
        }
      })
      .addCase(updateDriverVerification.rejected, (state, action) => {
        state.verificationLoading = false;
        state.error = action.payload?.message || 'Failed to update verification status';
      })

      // Submit KYC
      .addCase(submitDriverKYC.pending, (state) => {
        state.kycLoading = true;
        state.kycError = null;
      })
      .addCase(submitDriverKYC.fulfilled, (state, action) => {
        state.kycLoading = false;
        state.drivers = state.drivers.map(driver =>
          driver._id === action.payload._id ? action.payload : driver
        );
        if (state.currentDriver && state.currentDriver._id === action.payload._id) {
          state.currentDriver = action.payload;
        }
      })
      .addCase(submitDriverKYC.rejected, (state, action) => {
        state.kycLoading = false;
        state.kycError = action.payload?.message || 'Failed to submit KYC';
      })

      // Fetch KYC Data
      .addCase(fetchKYCData.pending, (state) => {
        state.kycLoading = true;
        state.kycError = null;
      })
      .addCase(fetchKYCData.fulfilled, (state, action) => {
        state.kycLoading = false;
        state.kycData = action.payload;
      })
      .addCase(fetchKYCData.rejected, (state, action) => {
        state.kycLoading = false;
        state.kycError = action.payload?.message || 'Failed to fetch KYC data';
      });
  },
});

export const { clearDriverError, setCurrentDriver, clearCurrentDriver } = driverSlice.actions;
export default driverSlice.reducer;