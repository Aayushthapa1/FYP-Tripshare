import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import notificationService from "../../services/notificationService";

// Get user notifications
export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications();
      console.log("Fetched notifications:", response);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch notifications"
      );
    }
  }
);

// Create notification
export const createNotification = createAsyncThunk(
  "notification/createNotification",
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await notificationService.createNotification(notificationData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to create notification"
      );
    }
  }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      if (!notificationId) {
        return rejectWithValue("Missing notification ID");
      }

      const response = await notificationService.markNotificationAsRead(notificationId);
      return { ...response, notificationId };
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to mark notification as read"
      );
    }
  }
);

// Mark all notifications as read
export const markAllAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAllNotificationsAsRead();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to mark all notifications as read"
      );
    }
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  "notification/deleteNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      if (!notificationId) {
        return rejectWithValue("Missing notification ID");
      }

      const response = await notificationService.deleteNotification(notificationId);
      return { ...response, notificationId };
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to delete notification"
      );
    }
  }
);

// Get unread count
export const getUnreadCount = createAsyncThunk(
  "notification/getUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.getUnreadCount();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to get unread count"
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
  // Socket integration properties
  isSocketConnected: false,
  activeUsers: { total: 0, driver: 0, user: 0 }
};

// Create the notification slice
const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    // Add new notification (from socket)
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

    // Set active users (from socket)
    setActiveUsers: (state, action) => {
      if (action.payload) {
        state.activeUsers = action.payload;
      }
    },

    // Set socket connection status
    setSocketConnected: (state, action) => {
      state.isSocketConnected = action.payload;
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
        // Handle possible response formats based on your API
        if (action.payload.success && action.payload.data) {
          state.notifications = action.payload.data;
          // Calculate unread count from the notifications
          state.unreadCount = action.payload.data.filter(
            (n) => !n.isRead || (n.readBy && n.readBy.length === 0)
          ).length;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching notifications";
      })

      // Create notification
      .addCase(createNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success && action.payload.data) {
          state.notifications.unshift(action.payload.data);
          if (!action.payload.data.isRead) {
            state.unreadCount += 1;
          }
        }
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error creating notification";
      })

      // Mark as read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.success) {
          // Find the notification by ID
          const index = state.notifications.findIndex(
            (n) => n._id === action.payload.notificationId
          );

          if (index !== -1) {
            // Update the notification
            state.notifications[index] = {
              ...state.notifications[index],
              isRead: true,
              // Update readBy if it exists
              readBy: action.payload.data?.readBy ||
                state.notifications[index].readBy || []
            };

            // Recalculate unread count
            state.unreadCount = state.notifications.filter(
              (n) => !n.isRead || (n.readBy && n.readBy.length === 0)
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
        if (action.payload && action.payload.success) {
          // Mark all as read in state
          state.notifications = state.notifications.map((n) => ({
            ...n,
            isRead: true,
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
        if (action.payload && action.payload.success) {
          // Find notification to check if it was unread
          const notification = state.notifications.find(
            (n) => n._id === action.payload.notificationId
          );

          // Remove from state
          state.notifications = state.notifications.filter(
            (n) => n._id !== action.payload.notificationId
          );

          // Update unread count if needed
          if (notification && (!notification.isRead || (notification.readBy && notification.readBy.length === 0))) {
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
        if (action.payload && action.payload.success &&
          typeof action.payload.count === "number") {
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
export const {
  addNotification,
  resetNotifications,
  clearError,
  setActiveUsers,
  setSocketConnected
} = notificationSlice.actions;

export default notificationSlice.reducer;