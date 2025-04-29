import mongoose from 'mongoose';

const DriverKYCSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required'],
  },
  citizenshipNumber: {
    type: String,
    required: [true, 'Citizenship number is required'],
    unique: true,
  },
  citizenshipFront: {
    type: String,
    required: [true, 'Front photo of citizenship is required'],
  },
  citizenshipBack: {
    type: String,
    required: [true, 'Back photo of citizenship is required'],
  },
  // Driver's License Information
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true,
  },
  licenseFront: {
    type: String,
    required: [true, 'Front photo of license is required'],
  },
  licenseBack: {
    type: String,
    required: [true, 'Back photo of license is required'],
  },
  licenseExpiryDate: {
    type: Date,
    required: [true, 'License expiry date is required'],
  },
  // Vehicle Information
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['bike', 'car', 'van', 'truck'],
  },
  vehicleModel: {
    type: String,
    required: [true, 'Vehicle model is required'],
  },

  vehicleYear: {
    type: Number,
    required: [true, 'Vehicle year is required'],
  },

  vehiclePhoto: {
    type: String,
    required: [true, 'Vehicle photo is required'],
  },
  kycStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'verified', 'rejected', 'needs_resubmission'],
    default: 'pending',
  },
  kycSubmittedAt: {
    type: Date,
    default: Date.now,
  },
  kycVerifiedAt: {
    type: Date,
  },
  kycRejectionReason: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Check if model exists before creating a new one
const DriverKYC = mongoose.models.DriverKYC || mongoose.model('DriverKYC', DriverKYCSchema);
export default DriverKYC;