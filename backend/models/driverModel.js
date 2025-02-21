import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema(
  {
    // Personal Information
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String, enum: ['Male', 'Female'], required: true },
    dob: { type: String, required: true }, // Date of Birth
    citizenshipNumber: { type: String, required: true, unique: true },
    photo: { type: String, required: true }, // URL to the uploaded photo

    // License Information
    licenseNumber: { type: String, unique: true },
    frontPhoto: { type: String }, // URL to the uploaded photo
    backPhoto: { type: String }, // URL to the uploaded photo

    // Vehicle Information
    vehicleType: { type: String, enum: ['Car', 'Bike', 'Electric'] },
    numberPlate: { type: String, unique: true },
    productionYear: { type: String },
    vehiclePhoto: { type: String }, // URL to the uploaded photo
    vehicleDetailPhoto: { type: String }, // URL to the uploaded photo
    ownerDetailPhoto: { type: String }, // URL to the uploaded photo
    renewalDetailPhoto: { type: String }, // URL to the uploaded photo

    // Additional Fields
    isVerified: { type: Boolean, default: false }, // Admin verification status
  },
  { timestamps: true }
);

export default mongoose.model('Driver', DriverSchema);