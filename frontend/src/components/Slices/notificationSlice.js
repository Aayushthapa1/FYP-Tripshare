import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import notificationService from "../../services/notificationService";

/** FETCH all notifications */
export const fetchNotifications = createAsyncThunk(
    "notifications/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationService.getNotifications();
            return response; // expected shape: { success: true, data: [...] }
        } catch (error) {
            return rejectWithValue(error.message || "Could not fetch notifications");
        }
    }
);

/** CREATE a notification */
export const createNotification = createAsyncThunk(
    "notifications/create",
    async (notificationData, { rejectWithValue }) => {
        try {
            const response = await notificationService.createNotification(notificationData);
            return response; // { success: true, data: newlyCreatedNotif }
        } catch (error) {
            return rejectWithValue(error.message || "Could not create notification");
        }
    }
);

/** MARK single notification as read */
export const markNotificationAsRead = createAsyncThunk(
    "notifications/markAsRead",
    async (notificationId, { rejectWithValue }) => {
        try {
            const response = await notificationService.markNotificationAsRead(notificationId);
            return response; // { success: true, data: updatedNotif }
        } catch (error) {
            return rejectWithValue(error.message || "Could not mark notification as read");
        }
    }
);

/** MARK all notifications as read */
export const markAllAsRead = createAsyncThunk(
    "notifications/markAllAsRead",
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationService.markAllNotificationsAsRead();
            return response; // e.g. { success: true, message: "All marked as read" }
        } catch (error) {
            return rejectWithValue(error.message || "Could not mark all as read");
        }
    }
);

/** DELETE a notification */
export const deleteNotification = createAsyncThunk(
    "notifications/delete",
    async (notificationId, { rejectWithValue }) => {
        try {
            const response = await notificationService.deleteNotification(notificationId);
            // We can return the notificationId so we can remove it in state
            return { ...response, notificationId };
        } catch (error) {
            return rejectWithValue(error.message || "Could not delete notification");
        }
    }
);

const initialState = {
    notifications: [],
    isLoading: false,
    error: null,
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        // e.g. push new notifications from Socket.IO events
        addNotification(state, action) {
            // Put new at top
            state.notifications.unshift(action.payload);
        },
        clearNotifications(state) {
            state.notifications = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // ============ FETCH NOTIFICATIONS ============
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.success) {
                    // action.payload.data is the array from server
                    state.notifications = action.payload.data;
                } else {
                    state.error = action.payload.error || "Failed to fetch notifications";
                }
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // ============ CREATE NOTIFICATION ============
            .addCase(createNotification.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createNotification.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.success) {
                    // Prepend newly created
                    state.notifications.unshift(action.payload.data);
                } else {
                    state.error = action.payload.error || "Failed to create notification";
                }
            })
            .addCase(createNotification.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // ============ MARK SINGLE NOTIFICATION READ ============
            .addCase(markNotificationAsRead.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.success) {
                    const updated = action.payload.data; // updated notification from server
                    const idx = state.notifications.findIndex((n) => n._id === updated._id);
                    if (idx !== -1) {
                        state.notifications[idx] = updated;
                    }
                } else {
                    state.error = action.payload.error || "Failed to mark notification as read";
                }
            })
            .addCase(markNotificationAsRead.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // ============ MARK ALL READ ============
            .addCase(markAllAsRead.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(markAllAsRead.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.success) {
                    // We can do a re-fetch, or update local state
                    // e.g. forcibly mark local readBy arrays
                    const userId = action.meta.arg?.userId;
                    if (!userId) {
                        // Maybe do a quick re-fetch here
                    }
                    state.notifications = state.notifications.map((notif) => ({
                        ...notif,
                        readBy: Array.from(new Set([...(notif.readBy || []), userId])),
                    }));
                } else {
                    state.error = action.payload.error || "Failed to mark all read";
                }
            })
            .addCase(markAllAsRead.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // ============ DELETE NOTIFICATION ============
            .addCase(deleteNotification.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.success) {
                    const { notificationId } = action.payload;
                    state.notifications = state.notifications.filter(
                        (n) => n._id !== notificationId
                    );
                } else {
                    state.error = action.payload.error || "Failed to delete notification";
                }
            })
            .addCase(deleteNotification.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
