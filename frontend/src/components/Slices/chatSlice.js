import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import chatService from "../../services/chatService"

// THUNK: Fetch all conversations
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getConversations()
      return response
    } catch (error) {
      return rejectWithValue(error || "Failed to fetch conversations")
    }
  }
)

// THUNK: Fetch messages of a specific contact
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (contactId, { rejectWithValue }) => {
    try {
      const response = await chatService.getMessages(contactId)
      return { contactId, data: response }
    } catch (error) {
      return rejectWithValue(error || "Failed to fetch messages")
    }
  }
)

// THUNK: Send a message
export const sendChatMessage = createAsyncThunk(
  "chat/sendMessage",
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMessage(messageData)
      return response
    } catch (error) {
      return rejectWithValue(error || "Failed to send message")
    }
  }
)

// THUNK: Mark messages as read
export const markMessagesAsRead = createAsyncThunk(
  "chat/markMessagesAsRead",
  async (contactId, { rejectWithValue }) => {
    try {
      const response = await chatService.markMessagesAsRead(contactId)
      return { contactId, data: response }
    } catch (error) {
      return rejectWithValue(error || "Failed to mark messages as read")
    }
  }
)

// THUNK: Get unread count
export const fetchUnreadCount = createAsyncThunk(
  "chat/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getUnreadCount()
      return response
    } catch (error) {
      return rejectWithValue(error || "Failed to fetch unread count")
    }
  }
)

const initialState = {
  conversations: [],   // Store conversation list
  messages: [],        // Store messages (you might keep them in an array or map them by contactId)
  unreadCount: 0,
  isLoading: false,
  error: null,
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    resetChatState: (state) => {
      state.conversations = []
      state.messages = []
      state.unreadCount = 0
      state.isLoading = false
      state.error = null
    },
    clearChatError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH CONVERSATIONS
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false
        // action.payload should be the entire response from server
        // e.g., { IsSuccess, ErrorMessage, Result: { conversations, count } } 
        // or your custom data shape. Adjust accordingly.
        if (action.payload?.IsSuccess) {
          state.conversations = action.payload.Result?.conversations || []
        } else if (action.payload?.conversations) {
          // If you're returning { conversations, count } directly from API
          state.conversations = action.payload.conversations
        } else {
          state.error = action.payload?.ErrorMessage || "Failed to fetch conversations"
        }
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })

      // FETCH MESSAGES
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false
        // action.payload = { contactId, data: response }
        // you might store messages in state by contactId or store them all in a single array
        state.messages = action.payload?.data?.messages || []
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })

      // SEND MESSAGE
      .addCase(sendChatMessage.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isLoading = false
        // The API might return the sent message object. You can push it into state.messages.
        if (action.payload?.IsSuccess) {
          // Example: if API structure is { IsSuccess, ErrorMessage, Result: { ...messageData } }
          const newMessage = action.payload.Result
          state.messages.push(newMessage)
        } else if (action.payload?.Data) {
          // or if your API returns the saved message in .Data
          const newMessage = action.payload.Data
          state.messages.push(newMessage)
        } else if (action.payload?.DataObject) {
          // or adapt as needed
          state.messages.push(action.payload.DataObject)
        } else {
          // If the response is the entire savedMessage
          state.messages.push(action.payload)
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })

      // MARK MESSAGES AS READ
      .addCase(markMessagesAsRead.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        state.isLoading = false
        // Optionally update local state to reflect read messages
        // action.payload = { contactId, data: { ... } }
        // For example, you might remove "read" flags, or recalculate unread
      })
      .addCase(markMessagesAsRead.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })

      // FETCH UNREAD COUNT
      .addCase(fetchUnreadCount.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload?.unreadCount !== undefined) {
          state.unreadCount = action.payload.unreadCount
        } else if (action.payload?.Result?.unreadCount) {
          state.unreadCount = action.payload.Result.unreadCount
        } else {
          state.unreadCount = 0
        }
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || action.error.message
      })
  },
})

export const { resetChatState, clearChatError } = chatSlice.actions
export default chatSlice.reducer
