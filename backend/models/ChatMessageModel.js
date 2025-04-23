import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
      index: true, // Add index for faster queries
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, "Message cannot be empty"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
      validate: {
        validator: function (v) {
          return v.trim().length > 0;
        },
        message: "Message content cannot be empty"
      }
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create compound index for faster querying of conversation history
chatMessageSchema.index({ rideId: 1, timestamp: 1 });
chatMessageSchema.index({ recipient: 1, status: 1 }); // For unread message queries
chatMessageSchema.index({ sender: 1, recipient: 1 }); // For conversation queries

// Pre-save hook to trim content and validate
chatMessageSchema.pre("save", function (next) {
  // Trim content
  if (this.content) {
    this.content = this.content.trim();
  }

  // Validate content is not empty after trimming
  if (!this.content) {
    return next(new Error("Message content cannot be empty"));
  }

  next();
});

// Virtual for message length
chatMessageSchema.virtual("contentLength").get(function () {
  return this.content ? this.content.length : 0;
});

// Method to mark as read
chatMessageSchema.methods.markAsRead = async function () {
  if (this.status !== "read") {
    this.status = "read";
    return this.save();
  }
  return this;
};

// Method to mark as delivered
chatMessageSchema.methods.markAsDelivered = async function () {
  if (this.status === "sent") {
    this.status = "delivered";
    return this.save();
  }
  return this;
};

// Static method to get conversation between two users for a ride
chatMessageSchema.statics.getConversation = async function (
  rideId,
  userId1,
  userId2,
  limit = 50,
  skip = 0
) {
  return this.find({
    rideId,
    $or: [
      { sender: userId1, recipient: userId2 },
      { sender: userId2, recipient: userId1 },
    ],
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate("sender", "fullName userName profileImage")
    .populate("recipient", "fullName userName profileImage");
};

// Static method to mark all messages as read
chatMessageSchema.statics.markAllAsRead = async function (rideId, recipientId) {
  return this.updateMany(
    { rideId, recipient: recipientId, status: { $ne: "read" } },
    { status: "read" }
  );
};

const ChatMessage =
  mongoose.models.ChatMessage ||
  mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;