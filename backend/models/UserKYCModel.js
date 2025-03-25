import mongoose from 'mongoose';

const UserKYCSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  
  citizenshipNumber: {
    type: String,
    required: [true, 'Citizenship number is required'],
    unique: true
  },
  citizenshipFront: {
    type: String,
    required: [true, 'Front photo of citizenship is required']
  },
  citizenshipBack: {
    type: String,
    required: [true, 'Back photo of citizenship is required']
  },
  kycStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'verified', 'rejected'],
    default: 'pending'
  },
  kycSubmittedAt: {
    type: Date,
    default: Date.now
  },
  kycVerifiedAt: {
    type: Date
  },
  kycRejectionReason: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Check if model exists before creating a new one
const UserKYC = mongoose.models.UserKYC || mongoose.model('UserKYC', UserKYCSchema);

export default UserKYC;