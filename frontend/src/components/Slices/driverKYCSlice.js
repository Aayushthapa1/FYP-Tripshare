import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  submitDriverKYC,
  getAllDriverKYCs,
  getDriverKYCById,
  getDriverKYCByUser,
  updateDriverKYC,
  updateKYCStatus,
  deleteDriverKYC,
} from "../../services/driverKYCService";

const initialState = {
  submissions: [],
  currentSubmission: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  operation: null, // 'create', 'fetchAll', 'fetchById', 'fetchByUser', 'update', 'status', 'delete'
};

// CREATE KYC
export const createDriverKYCAction = createAsyncThunk(
  "driverKYC/create",
  async (data, { rejectWithValue }) => {
    try {
      const doc = await submitDriverKYC(data);
      return doc;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// FETCH ALL KYC
export const fetchAllDriverKYCsAction = createAsyncThunk(
  "driverKYC/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getAllDriverKYCs(params);
      return {
        data: response.data || [],
        pagination: response.pagination || {},
      };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// FETCH KYC BY ID
export const fetchDriverKYCByIdAction = createAsyncThunk(
  "driverKYC/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const doc = await getDriverKYCById(id);
      return doc;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// FETCH KYC BY USER
export const fetchDriverKYCByUserAction = createAsyncThunk(
  "driverKYC/fetchByUser",
  async (userId, { rejectWithValue }) => {
    try {
      const doc = await getDriverKYCByUser(userId);
      return doc;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// UPDATE KYC
export const updateDriverKYCAction = createAsyncThunk(
  "driverKYC/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const updatedDoc = await updateDriverKYC(id, data);
      return updatedDoc;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// UPDATE KYC STATUS
export const updateDriverKYCStatusAction = createAsyncThunk(
  "driverKYC/updateStatus",
  async ({ id, statusData }, { rejectWithValue }) => {
    try {
      const doc = await updateKYCStatus(id, statusData);
      return doc;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// DELETE KYC
export const deleteDriverKYCAction = createAsyncThunk(
  "driverKYC/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteDriverKYC(id);
      return id; // the deleted _id
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const driverKYCSlice = createSlice({
  name: "driverKYC",
  initialState,
  reducers: {
    resetKYCState: () => ({ ...initialState }),
    clearKYCError: (state) => {
      state.error = null;
    },
    clearCurrentSubmission: (state) => {
      state.currentSubmission = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createDriverKYCAction.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.operation = "create";
        state.error = null;
      })
      .addCase(createDriverKYCAction.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const newDoc = action.payload;
        // Add doc to the top of the array
        state.submissions.unshift(newDoc);
        state.currentSubmission = newDoc;
        state.operation = null;
      })
      .addCase(createDriverKYCAction.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
        state.operation = null;
      })

      // FETCH ALL
      .addCase(fetchAllDriverKYCsAction.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.operation = "fetchAll";
        state.error = null;
      })
      .addCase(fetchAllDriverKYCsAction.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.submissions = action.payload.data;
        state.pagination = action.payload.pagination;
        state.operation = null;
      })
      .addCase(fetchAllDriverKYCsAction.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
        state.operation = null;
      })

      // FETCH BY ID
      .addCase(fetchDriverKYCByIdAction.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.operation = "fetchById";
        state.error = null;
      })
      .addCase(fetchDriverKYCByIdAction.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.currentSubmission = action.payload;
        state.operation = null;
      })
      .addCase(fetchDriverKYCByIdAction.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
        state.operation = null;
      })

      // FETCH BY USER
      .addCase(fetchDriverKYCByUserAction.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.operation = "fetchByUser";
        state.error = null;
      })
      .addCase(fetchDriverKYCByUserAction.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.currentSubmission = action.payload;
        state.operation = null;
      })
      .addCase(fetchDriverKYCByUserAction.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
        state.operation = null;
      })

      // UPDATE
      .addCase(updateDriverKYCAction.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.operation = "update";
        state.error = null;
      })
      .addCase(updateDriverKYCAction.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updatedDoc = action.payload;
        state.submissions = state.submissions.map((sub) =>
          sub._id === updatedDoc._id ? updatedDoc : sub
        );
        state.currentSubmission = updatedDoc;
        state.operation = null;
      })
      .addCase(updateDriverKYCAction.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
        state.operation = null;
      })

      // UPDATE STATUS
      .addCase(updateDriverKYCStatusAction.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.operation = "status";
        state.error = null;
      })
      .addCase(updateDriverKYCStatusAction.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updatedDoc = action.payload;
        state.submissions = state.submissions.map((sub) =>
          sub._id === updatedDoc._id ? updatedDoc : sub
        );
        if (state.currentSubmission?._id === updatedDoc._id) {
          state.currentSubmission = updatedDoc;
        }
        state.operation = null;
      })
      .addCase(updateDriverKYCStatusAction.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
        state.operation = null;
      })

      // DELETE
      .addCase(deleteDriverKYCAction.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.operation = "delete";
        state.error = null;
      })
      .addCase(deleteDriverKYCAction.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const deletedId = action.payload;
        state.submissions = state.submissions.filter(
          (sub) => sub._id !== deletedId
        );
        if (state.currentSubmission?._id === deletedId) {
          state.currentSubmission = null;
        }
        state.operation = null;
      })
      .addCase(deleteDriverKYCAction.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
        state.operation = null;
      });
  },
});

export const { resetKYCState, clearKYCError, clearCurrentSubmission } =
  driverKYCSlice.actions;

export default driverKYCSlice.reducer;
