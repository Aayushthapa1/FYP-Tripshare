import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // The textual content or data for this notification
    message: { type: String, required: true },

    // The "type" (e.g., "trip" or "chat_message" etc.)
    type: { type: String, default: "general" },

    // Who should see this notification? Could be "all", an array of userIds, or a role
    audience: { type: String, default: "all" },

    // If you want to target specific user(s):
    userIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Mark whether it has been read or not
    // If storing for multiple users, you can store an array of readBy userIds
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
