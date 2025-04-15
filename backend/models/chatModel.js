import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderType: {
    type: String,
    enum: ['user', 'driver', 'system'],  // Added 'system' for automated messages
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    required: true,
    default: 'text'
  },
  content: {
    type: String,
    required: function () {
      return this.messageType === 'text';
    },
    trim: true
  },
  mediaUrl: {
    type: String,
    required: function () {
      return ['image', 'file'].includes(this.messageType);
    }
  },
  mediaThumbnail: String,
  mediaSize: Number,
  mediaDimensions: {
    width: Number,
    height: Number
  },
  fileName: String,
  fileType: String,
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true }
});

// Indexes
messageSchema.index({ tripId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ read: 1 });

messageSchema.index({ tripId: 1, sender: 1, read: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;