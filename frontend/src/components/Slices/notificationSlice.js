import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API URL constant
const API_URL = "http://localhost:3301/api/notifications";

// Get user notifications
export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?._id;

      if (!userId) {
        return rejectWithValue("User not authenticated");
      }

      const response = await axios.get(`${API_URL}/user?userId=${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notifications"
      );
    }
  }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?._id;

      if (!userId || !notificationId) {
        return rejectWithValue("Missing required data");
      }

      const response = await axios.patch(`${API_URL}/read/${notificationId}`, {
        userId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark notification as read"
      );
    }
  }
);

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?._id;

      if (!userId) {
        return rejectWithValue("User not authenticated");
      }

      const response = await axios.patch(`${API_URL}/read-all`, { userId });
      return { ...response.data, userId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to mark all notifications as read"
      );
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  "notification/deleteNotification",
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?._id;

      if (!userId || !notificationId) {
        return rejectWithValue("Missing required data");
      }

      const response = await axios.delete(`${API_URL}/${notificationId}`, {
        data: { userId },
      });
      return { ...response.data, notificationId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete notification"
      );
    }
  }
);

// Get unread count
export const getUnreadCount = createAsyncThunk(
  "notification/getUnreadCount",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user?._id;

      if (!userId) {
        return rejectWithValue("User not authenticated");
      }

      const response = await axios.get(`${API_URL}/unread-count/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get unread count"
      );
    }
  }
);

// Define the initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Create the notification slice
const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    // Add new notification (e.g. from socket)
    addNotification: (state, action) => {
      // Validate the notification
      if (!action.payload || !action.payload._id) return;

      // Check if notification already exists
      const exists = state.notifications.some(
        (n) => n._id === action.payload._id
      );

      if (!exists) {
        state.notifications.unshift(action.payload);
        // Increment unread count
        state.unreadCount += 1;
      }
    },

    // Reset notification state
    resetNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.loading = false;
      state.error = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we have valid data
        if (action.payload && action.payload.data) {
          state.notifications = action.payload.data;
          // Calculate unread count
          state.unreadCount = action.payload.data.filter(
            (n) => !n.isRead
          ).length;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching notifications";
      })

      // Mark as read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.data) {
          // Update notification in state
          const index = state.notifications.findIndex(
            (n) => n._id === action.payload.data._id
          );
          if (index !== -1) {
            state.notifications[index] = action.payload.data;
            // Recalculate unread count
            state.unreadCount = state.notifications.filter(
              (n) => !n.isRead
            ).length;
          }
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error marking notification as read";
      })

      // Mark all as read
      .addCase(markAllAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          // Mark all as read in state
          state.notifications = state.notifications.map((n) => ({
            ...n,
            isRead: true,
            readBy: [...(n.readBy || []), action.payload.userId],
          }));
          state.unreadCount = 0;
        }
      })
      .addCase(markAllAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Error marking all notifications as read";
      })

      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.notificationId) {
          // Find notification
          const notification = state.notifications.find(
            (n) => n._id === action.payload.notificationId
          );
          // Remove from state
          state.notifications = state.notifications.filter(
            (n) => n._id !== action.payload.notificationId
          );
          // Update unread count if needed
          if (notification && !notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error deleting notification";
      })

      // Get unread count
      .addCase(getUnreadCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload.count === "number") {
          state.unreadCount = action.payload.count;
        }
      })
      .addCase(getUnreadCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error getting unread count";
      });
  },
});

// Export actions and reducer
export const { addNotification, resetNotifications, clearError } =
  notificationSlice.actions;

export default notificationSlice.reducer;
