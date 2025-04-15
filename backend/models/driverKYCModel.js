import mongoose from "mongoose";
import validator from "validator";

const DriverSchema = new mongoose.Schema(
  {
    // Personal Information
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Gender is required"],
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
    },
    citizenshipNumber: {
      type: String,
      required: [true, "Citizenship number is required"],
      trim: true,
    },
    photo: {
      type: String,
      required: [true, "Photo is required"],
    },

    // License Information
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      trim: true,
    },
    licenseExpiryDate: {
      type: Date,
      required: [true, "License expiry date is required"],
    },
    frontPhoto: {
      type: String,
      required: [true, "Front photo of license is required"],
    },
    backPhoto: {
      type: String,
      required: [true, "Back photo of license is required"],
    },

    // Vehicle Information (optional)
    vehicleType: {
      type: String,
      enum: ["Car", "Bike", "Electric", "Truck", "Auto"],
    },
    numberPlate: {
      type: String,
      trim: true,
      uppercase: true,
    },
    vehiclePhoto: {
      type: String,
    },

    // KYC Status
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "needs_resubmission"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
    },
    verifiedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    // Reference to User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for age calculation
DriverSchema.virtual("age").get(function () {
  if (!this.dob) return null;
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// If status changes to verified, set verifiedAt
DriverSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "verified") {
      this.verifiedAt = new Date();
    }
  }
  next();
});

// Indexes
DriverSchema.index({ status: 1 });
DriverSchema.index({ user: 1 });

const DriverModel = mongoose.model("Driver", DriverSchema);
export default DriverModel;
