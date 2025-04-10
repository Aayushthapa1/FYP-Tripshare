import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null indicates system notification
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "general",
        "system",
        "ride_request",
        "ride_accepted",
        "ride_picked_up",
        "ride_completed",
        "ride_canceled",
        "ride_rejected",
        "driver_ride_request",
        "payment",
        "trip_created",
        "trip_booked",
        "trip_canceled",
        "trip_completed",
        "message",
      ],
      default: "general",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    data: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
