import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import driverKYCService from "../../services/driverKYCService"

const initialState = {
  drivers: [],
  pendingDrivers: [],
  currentDriver: null,
  loading: false,
  updateLoading: false,
  error: null,
  kycStatus: null,
}

// 1) **Save Personal Info**
export const savePersonalInfo = createAsyncThunk(
  "driverKYC/savePersonalInfo",
  async (formData, { rejectWithValue }) => {
    try {
      return await driverKYCService.savePersonalInfo(formData)
    } catch (error) {
      console.error("Error saving personal info:", error.message)
      return rejectWithValue(error.message)
    }
  },
)

// 2) **Save License Info**
export const saveLicenseInfo = createAsyncThunk(
  "driverKYC/saveLicenseInfo",
  async ({ driverId, formData }, { rejectWithValue }) => {
    try {
      return await driverKYCService.saveLicenseInfo(driverId, formData)
    } catch (error) {
      console.error("Error saving license info:", error.message)
      return rejectWithValue(error.message)
    }
  },
)

// 3) **Save Vehicle Info**
export const saveVehicleInfo = createAsyncThunk(
  "driverKYC/saveVehicleInfo",
  async ({ driverId, formData }, { rejectWithValue }) => {
    try {
      return await driverKYCService.saveVehicleInfo(driverId, formData)
    } catch (error) {
      console.error("Error saving vehicle info:", error.message)
      return rejectWithValue(error.message)
    }
  },
)

// 4) **Submit Complete Driver KYC**
export const submitDriverKYC = createAsyncThunk("driverKYC/submitDriverKYC", async (formData, { rejectWithValue }) => {
  try {
    return await driverKYCService.submitDriverKYC(formData)
  } catch (error) {
    console.error("Error submitting driver KYC:", error.message)
    return rejectWithValue(error.message)
  }
})

// 5) **Fetch All Drivers**
export const fetchAllDrivers = createAsyncThunk("driverKYC/fetchAllDrivers", async (_, { rejectWithValue }) => {
  try {
    const response = await driverKYCService.getAllDrivers()
    return response.drivers || response // Handle both response formats
  } catch (error) {
    console.error("Error fetching drivers:", error.message)
    return rejectWithValue(error.message)
  }
})

// 6) **Fetch Driver by ID**
export const fetchDriverById = createAsyncThunk("driverKYC/fetchDriverById", async (driverId, { rejectWithValue }) => {
  try {
    return await driverKYCService.getDriverById(driverId)
  } catch (error) {
    console.error(`Error fetching driver ${driverId}:`, error.message)
    return rejectWithValue(error.message)
  }
})

// 7) **Fetch Pending Driver KYC Requests**
export const fetchPendingDriverKYC = createAsyncThunk(
  "driverKYC/fetchPendingDriverKYC",
  async (_, { rejectWithValue }) => {
    try {
      const response = await driverKYCService.getPendingDriverKYC()
      return response.drivers || response // Handle both response formats
    } catch (error) {
      console.error("Error fetching pending driver KYC requests:", error.message)
      return rejectWithValue(error.message)
    }
  },
)

// 8) **Update Driver KYC Verification**
export const updateDriverKYCVerification = createAsyncThunk(
  "driverKYC/updateDriverKYCVerification",
  async ({ driverId, status, rejectionReason }, { rejectWithValue }) => {
    try {
      return await driverKYCService.updateDriverKYCVerification(driverId, status, rejectionReason)
    } catch (error) {
      console.error(`Error updating verification for driver ${driverId}:`, error.message)
      return rejectWithValue(error.message)
    }
  },
)

// 9) **Get Driver KYC Status**
export const getDriverKYCStatus = createAsyncThunk(
  "driverKYC/getDriverKYCStatus",
  async (driverId, { rejectWithValue }) => {
    try {
      return await driverKYCService.getDriverKYCStatus(driverId)
    } catch (error) {
      console.error(`Error getting KYC status for driver ${driverId}:`, error.message)
      return rejectWithValue(error.message)
    }
  },
)

const driverKYCSlice = createSlice({
  name: "driverKYC",
  initialState,
  reducers: {
    clearDriverKYCError: (state) => {
      state.error = null
    },
    setCurrentDriver: (state, action) => {
      state.currentDriver = action.payload
    },
    clearCurrentDriver: (state) => {
      state.currentDriver = null
    },
  },
  extraReducers: (builder) => {
    builder
      // 1) Save Personal Info
      .addCase(savePersonalInfo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(savePersonalInfo.fulfilled, (state, action) => {
        state.loading = false
        const driver = action.payload.driver || action.payload

        // Update in drivers array if exists
        const driverIndex = state.drivers.findIndex((d) => d._id === driver._id)
        if (driverIndex >= 0) {
          state.drivers[driverIndex] = driver
        } else {
          state.drivers.push(driver)
        }

        state.currentDriver = driver
      })
      .addCase(savePersonalInfo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // 2) Save License Info
      .addCase(saveLicenseInfo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(saveLicenseInfo.fulfilled, (state, action) => {
        state.loading = false
        const driver = action.payload.driver || action.payload

        // Update in drivers array
        const driverIndex = state.drivers.findIndex((d) => d._id === driver._id)
        if (driverIndex >= 0) {
          state.drivers[driverIndex] = driver
        }

        state.currentDriver = driver
      })
      .addCase(saveLicenseInfo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // 3) Save Vehicle Info
      .addCase(saveVehicleInfo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(saveVehicleInfo.fulfilled, (state, action) => {
        state.loading = false
        const driver = action.payload.driver || action.payload

        // Update in drivers array
        const driverIndex = state.drivers.findIndex((d) => d._id === driver._id)
        if (driverIndex >= 0) {
          state.drivers[driverIndex] = driver
        }

        state.currentDriver = driver
      })
      .addCase(saveVehicleInfo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // 4) Submit Complete Driver KYC
      .addCase(submitDriverKYC.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitDriverKYC.fulfilled, (state, action) => {
        state.loading = false
        const driver = action.payload.driver || action.payload

        // Update in drivers array if exists
        const driverIndex = state.drivers.findIndex((d) => d._id === driver._id)
        if (driverIndex >= 0) {
          state.drivers[driverIndex] = driver
        } else {
          state.drivers.push(driver)
        }

        state.currentDriver = driver
        state.kycStatus = driver.kycStatus || "pending"
      })
      .addCase(submitDriverKYC.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // 5) Fetch All Drivers
      .addCase(fetchAllDrivers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllDrivers.fulfilled, (state, action) => {
        state.loading = false
        state.drivers = action.payload
      })
      .addCase(fetchAllDrivers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // 6) Fetch Driver by ID
      .addCase(fetchDriverById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDriverById.fulfilled, (state, action) => {
        state.loading = false
        state.currentDriver = action.payload
      })
      .addCase(fetchDriverById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // 7) Fetch Pending Driver KYC
      .addCase(fetchPendingDriverKYC.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPendingDriverKYC.fulfilled, (state, action) => {
        state.loading = false
        state.pendingDrivers = action.payload
      })
      .addCase(fetchPendingDriverKYC.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // 8) Update Driver KYC Verification
      .addCase(updateDriverKYCVerification.pending, (state) => {
        state.updateLoading = true
        state.error = null
      })
      .addCase(updateDriverKYCVerification.fulfilled, (state, action) => {
        state.updateLoading = false
        const updatedDriver = action.payload.driver || action.payload

        // Update in drivers array
        const driverIndex = state.drivers.findIndex((d) => d._id === updatedDriver._id)
        if (driverIndex >= 0) {
          state.drivers[driverIndex] = updatedDriver
        }

        // Update in pendingDrivers array
        const pendingIndex = state.pendingDrivers.findIndex((d) => d._id === updatedDriver._id)
        if (pendingIndex >= 0) {
          // Remove from pending if verified
          if (updatedDriver.kycStatus === "verified") {
            state.pendingDrivers = state.pendingDrivers.filter((d) => d._id !== updatedDriver._id)
          } else {
            // Update in pending array
            state.pendingDrivers[pendingIndex] = updatedDriver
          }
        }

        // Update currentDriver if it's the same driver
        if (state.currentDriver && state.currentDriver._id === updatedDriver._id) {
          state.currentDriver = updatedDriver
        }
      })
      .addCase(updateDriverKYCVerification.rejected, (state, action) => {
        state.updateLoading = false
        state.error = action.payload
      })

      // 9) Get Driver KYC Status
      .addCase(getDriverKYCStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getDriverKYCStatus.fulfilled, (state, action) => {
        state.loading = false
        state.kycStatus = action.payload.kycStatus
        state.currentDriver = action.payload.driver
      })
      .addCase(getDriverKYCStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearDriverKYCError, setCurrentDriver, clearCurrentDriver } = driverKYCSlice.actions
export default driverKYCSlice.reducer

