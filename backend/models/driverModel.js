import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema(
  {
    // Personal Information
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true }, // Added "Other"
    dob: { type: Date, required: true }, // Changed to Date type
    citizenshipNumber: { type: String, required: true, unique: true },
    photo: { type: String, required: true },

    // License Information
    licenseNumber: { type: String, unique: true },
    frontPhoto: { type: String },
    backPhoto: { type: String },

    // Vehicle Information
    vehicleType: { type: String, enum: ["Car", "Bike", "Electric"], required: true },
    numberPlate: { type: String, unique: true, required: true },
    productionYear: { type: Number, required: true }, // Changed to Number type
    vehiclePhoto: { type: String, required: true },
    vehicleDetailPhoto: { type: String, required: true },
    ownerDetailPhoto: { type: String, required: true },
    renewalDetailPhoto: { type: String, required: true },

    // KYC Status
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "needs_resubmission"], // Added "needs_resubmission"
      default: "pending",
    },
    rejectionReason: { type: String }, // Added for storing rejection reasons

    // Reference to User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TripShare",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Driver", DriverSchema);