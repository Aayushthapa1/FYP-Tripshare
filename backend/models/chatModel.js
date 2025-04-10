import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  senderType: {
    type: String,
    enum: ['User', 'Driver'],  
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  receiverType: {
    type: String,
    enum: ['User', 'Driver'], 
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
  
}, {
  timestamps: true,
});

// Index for faster querying
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, read: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;