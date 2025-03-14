import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema(
  {
    // Personal Information
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    dob: { type: Date, required: true },
    citizenshipNumber: { type: String, required: true, unique: true },
    photo: { type: String, required: true },

    // License Information
    licenseNumber: { type: String, unique: true },
    frontPhoto: { type: String },
    backPhoto: { type: String },

    // Vehicle Information
    vehicleType: { type: String, enum: ["Car", "Bike", "Electric"], required: false },
    numberPlate: { type: String, unique: true, required: false },
    productionYear: { type: Number, required: false },
    vehiclePhoto: { type: String, required: false },
    vehicleDetailPhoto: { type: String, required: false },
    ownerDetailPhoto: { type: String, required: false },
    renewalDetailPhoto: { type: String, required: false },
    

    // KYC Status
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "needs_resubmission"],
      default: "pending",
    },
    rejectionReason: { type: String },

    // Reference to User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const DriverModel = mongoose.model("Driver", DriverSchema);

export default DriverModel;
