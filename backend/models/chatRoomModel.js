import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
  participants: {
    type: [String], // array of userIds
    required: true,
  },
}, {
  timestamps: true, // createdAt, updatedAt
});

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

export default ChatRoom;
