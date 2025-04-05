import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "../../services/chatService";

// Async thunks for chat operations

// GET TRIP MESSAGES
export const fetchTripMessages = createAsyncThunk(
  "chat/fetchTripMessages",
  async ({ tripId, page, limit }, { rejectWithValue }) => {
    try {
      return await chatService.getTripMessages(tripId, page, limit);
    } catch (error) {
      return rejectWithValue(error || "Failed to fetch messages");
    }
  }
);

// SEND TEXT MESSAGE
export const sendTextMessage = createAsyncThunk(
  "chat/sendTextMessage",
  async ({ tripId, content }, { rejectWithValue }) => {
    try {
      return await chatService.sendTextMessage(tripId, content);
    } catch (error) {
      return rejectWithValue(error || "Failed to send message");
    }
  }
);

// SEND IMAGE MESSAGE
export const sendImageMessage = createAsyncThunk(
  "chat/sendImageMessage",
  async ({ tripId, imageFile }, { rejectWithValue }) => {
    try {
      return await chatService.sendImageMessage(tripId, imageFile);
    } catch (error) {
      return rejectWithValue(error || "Failed to send image");
    }
  }
);

// SEND FILE MESSAGE
export const sendFileMessage = createAsyncThunk(
  "chat/sendFileMessage",
  async ({ tripId, file }, { rejectWithValue }) => {
    try {
      return await chatService.sendFileMessage(tripId, file);
    } catch (error) {
      return rejectWithValue(error || "Failed to send file");
    }
  }
);

// DELETE MESSAGE
export const deleteMessage = createAsyncThunk(
  "chat/deleteMessage",
  async (messageId, { rejectWithValue }) => {
    try {
      return await chatService.deleteMessage(messageId);
    } catch (error) {
      return rejectWithValue(error || "Failed to delete message");
    }
  }
);

// GET UNREAD COUNT
export const fetchUnreadCount = createAsyncThunk(
  "chat/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      return await chatService.getUnreadCount();
    } catch (error) {
      return rejectWithValue(error || "Failed to fetch unread count");
    }
  }
);

// GET MESSAGE BY ID
export const fetchMessageById = createAsyncThunk(
  "chat/fetchMessageById",
  async (messageId, { rejectWithValue }) => {
    try {
      return await chatService.getMessageById(messageId);
    } catch (error) {
      return rejectWithValue(error || "Failed to fetch message");
    }
  }
);

// MARK MESSAGES AS READ
export const markMessagesAsRead = createAsyncThunk(
  "chat/markMessagesAsRead",
  async ({ tripId, messageIds }, { rejectWithValue }) => {
    try {
      return await chatService.markMessagesAsRead(tripId, messageIds);
    } catch (error) {
      return rejectWithValue(error || "Failed to mark messages as read");
    }
  }
);

// GET CHAT STATISTICS
export const fetchChatStatistics = createAsyncThunk(
  "chat/fetchChatStatistics",
  async (tripId, { rejectWithValue }) => {
    try {
      return await chatService.getChatStatistics(tripId);
    } catch (error) {
      return rejectWithValue(error || "Failed to fetch chat statistics");
    }
  }
);

// SET TYPING STATUS
export const setTypingStatus = createAsyncThunk(
  "chat/setTypingStatus",
  async ({ tripId, isTyping }, { rejectWithValue }) => {
    try {
      return await chatService.setTypingStatus(tripId, isTyping);
    } catch (error) {
      return rejectWithValue(error || "Failed to set typing status");
    }
  }
);

// SEARCH MESSAGES
export const searchMessages = createAsyncThunk(
  "chat/searchMessages",
  async ({ tripId, query, page, limit }, { rejectWithValue }) => {
    try {
      return await chatService.searchMessages(tripId, query, page, limit);
    } catch (error) {
      return rejectWithValue(error || "Failed to search messages");
    }
  }
);

// Initial state
const initialState = {
  messages: [],
  currentMessage: null,
  unreadCount: {
    count: 0,
    tripBreakdown: []
  },
  statistics: null,
  searchResults: [],
  isLoading: false,
  isSending: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0
  },
  typingUsers: {} // Format: { tripId: { userId: timestamp } }
};

// Chat slice
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearChatError: (state) => {
      state.error = null;
    },
    resetChatState: (state) => {
      return initialState;
    },
    addLocalMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateTypingStatus: (state, action) => {
      const { tripId, userId, isTyping, timestamp } = action.payload;
      
      if (!state.typingUsers[tripId]) {
        state.typingUsers[tripId] = {};
      }
      
      if (isTyping) {
        state.typingUsers[tripId][userId] = timestamp;
      } else {
        delete state.typingUsers[tripId][userId];
      }
    },
    removeLocalMessage: (state, action) => {
      const messageId = action.payload;
      state.messages = state.messages.filter(msg => msg._id !== messageId);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Trip Messages
      .addCase(fetchTripMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTripMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalMessages: action.payload.totalMessages
        };
      })
      .addCase(fetchTripMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Send Text Message
      .addCase(sendTextMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendTextMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.messages.push(action.payload);
      })
      .addCase(sendTextMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload || action.error.message;
      })

      // Send Image Message
      .addCase(sendImageMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendImageMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.messages.push(action.payload);
      })
      .addCase(sendImageMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload || action.error.message;
      })

      // Send File Message
      .addCase(sendFileMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendFileMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.messages.push(action.payload);
      })
      .addCase(sendFileMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload || action.error.message;
      })

      // Delete Message
      .addCase(deleteMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = state.messages.filter(
          (msg) => msg._id !== action.payload.deletedMessageId
        );
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch Unread Count
      .addCase(fetchUnreadCount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch Message By ID
      .addCase(fetchMessageById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessageById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMessage = action.payload;
      })
      .addCase(fetchMessageById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Mark Messages as Read
      .addCase(markMessagesAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update read status in local messages
        if (action.meta.arg.messageIds) {
          state.messages = state.messages.map(msg => 
            action.meta.arg.messageIds.includes(msg._id) 
              ? { ...msg, read: true } 
              : msg
          );
        }
      })
      .addCase(markMessagesAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Fetch Chat Statistics
      .addCase(fetchChatStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchChatStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })

      // Set Typing Status
      .addCase(setTypingStatus.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })

      // Search Messages
      .addCase(searchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.messages;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalMessages: action.payload.totalMessages
        };
      })
      .addCase(searchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { 
  clearChatError, 
  resetChatState, 
  addLocalMessage, 
  updateTypingStatus,
  removeLocalMessage
} = chatSlice.actions;

export default chatSlice.reducer;