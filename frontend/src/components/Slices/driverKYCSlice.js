// driverKYCSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  submitDriverKYC,
  getAllDriverKYCs,
  getDriverKYCById,
  updateDriverKYC,
  updateKYCStatus,
  deleteDriverKYC
} from "../../services/driverKYCService";

const initialState = {
  submissions: [],       // list of KYC docs
  currentSubmission: null, // single doc in focus
  loading: false,        // for spinners
  error: null,           // for errors
  status: "idle",        // 'idle' | 'loading' | 'succeeded' | 'failed'
  operation: null,       // 'create' | 'update' | 'delete' | 'status' | 'fetchAll' | 'fetchById'
};

// 1) CREATE KYC (Driver side)
export const createDriverKYCAction = createAsyncThunk(
  "driverKYC/create",
  async (data, { rejectWithValue }) => {
    try {
      const doc = await submitDriverKYC(data);
      return doc; // doc is the created record
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// 2) FETCH ALL KYC (Admin side)
export const fetchAllDriverKYCsAction = createAsyncThunk(
  "driverKYC/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      // params can contain { status, page, limit }
      const docs = await getAllDriverKYCs(params);
      return docs; // array of driver KYC docs
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// 3) FETCH KYC BY ID
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

// 4) UPDATE KYC (Driver side)
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

// 5) UPDATE KYC STATUS (Admin side)
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

// 6) DELETE KYC (Admin side)
export const deleteDriverKYCAction = createAsyncThunk(
  "driverKYC/delete",
  async (id, { rejectWithValue }) => {
    try {
      // The service returns { success: true, message: "..." }
      // We don't get the doc, so we just return the ID for local removal
      await deleteDriverKYC(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const driverKYCSlice = createSlice({
  name: "driverKYC",
  initialState,
  reducers: {
    resetKYCState: (state) => {
      Object.assign(state, initialState);
    },
    clearKYCError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE
      .addCase(createDriverKYCAction.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.operation = "create";
      })
      .addCase(createDriverKYCAction.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        // action.payload is the new doc
        state.submissions.push(action.payload);
        state.currentSubmission = action.payload;
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
      })
      .addCase(fetchAllDriverKYCsAction.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        // action.payload is an array of docs
        state.submissions = action.payload;
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
      })
      .addCase(fetchDriverKYCByIdAction.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        // single doc
        state.currentSubmission = action.payload;
      })
      .addCase(fetchDriverKYCByIdAction.rejected, (state, action) => {
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
      })
      .addCase(updateDriverKYCAction.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        // updated doc
        const updatedDoc = action.payload;
        state.submissions = state.submissions.map((sub) =>
          sub._id === updatedDoc._id ? updatedDoc : sub
        );
        state.currentSubmission = updatedDoc;
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
      })
      .addCase(updateDriverKYCStatusAction.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        // new doc with changed status
        const updatedDoc = action.payload;
        state.submissions = state.submissions.map((sub) =>
          sub._id === updatedDoc._id ? updatedDoc : sub
        );
        state.currentSubmission = updatedDoc;
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
      })
      .addCase(deleteDriverKYCAction.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        // action.payload is just the ID we returned
        const deletedId = action.payload;
        state.submissions = state.submissions.filter(
          (sub) => sub._id !== deletedId
        );
        if (state.currentSubmission?._id === deletedId) {
          state.currentSubmission = null;
        }
      })
      .addCase(deleteDriverKYCAction.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = action.payload;
        state.operation = null;
      });
  },
});

export const { resetKYCState, clearKYCError } = driverKYCSlice.actions;
export default driverKYCSlice.reducer;
