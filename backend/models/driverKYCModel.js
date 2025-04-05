
import mongoose from "mongoose";
import validator from "validator";

const DriverSchema = new mongoose.Schema(
  {
    // Personal Information
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return /^\+?\d{10,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    gender: {
      type: String,
      enum: {
        values: ["Male", "Female", "Other"],
        message: "{VALUE} is not a valid gender option",
      },
      required: [true, "Gender is required"],
    },
    dob: {
      type: Date,
      required: [true, "Date of birth is required"],
      validate: {
        validator: function (dob) {
          const eighteenYearsAgo = new Date();
          eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
          return dob <= eighteenYearsAgo;
        },
        message: "Driver must be at least 18 years old",
      },
    },
    citizenshipNumber: {
      type: String,
      required: [true, "Citizenship number is required"],
      unique: true,
      trim: true,
    },
    photo: {
      type: String,
      required: [true, "Photo is required"],
      validate: {
        validator: function (v) {
          return /\.(jpg|jpeg|png)$/i.test(v);
        },
        message: (props) =>
          "Photo must be a valid image file (jpg, jpeg, png)",
      },
    },

    // License Information
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
      trim: true,
    },
    licenseExpiryDate: {
      type: Date,
      required: [true, "License expiry date is required"],
      validate: {
        validator: function (date) {
          return date > new Date();
        },
        message: "License must not be expired",
      },
    },
    frontPhoto: {
      type: String,
      required: [true, "Front photo of license is required"],
      validate: {
        validator: function (v) {
          return /\.(jpg|jpeg|png)$/i.test(v);
        },
        message: (props) =>
          "Photo must be a valid image file (jpg, jpeg, png)",
      },
    },
    backPhoto: {
      type: String,
      required: [true, "Back photo of license is required"],
      validate: {
        validator: function (v) {
          return /\.(jpg|jpeg|png)$/i.test(v);
        },
        message: (props) =>
          "Photo must be a valid image file (jpg, jpeg, png)",
      },
    },

    // Vehicle Information
    vehicleType: {
      type: String,
      enum: {
        values: ["Car", "Bike", "Electric", "Truck", "Auto"],
        message: "{VALUE} is not a valid vehicle type",
      },
    },
    numberPlate: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    productionYear: {
      type: Number,
      min: [1990, "Vehicle must be manufactured after 1990"],
      max: [
        new Date().getFullYear() + 1,
        "Production year cannot be in the future",
      ],
    },
    vehiclePhoto: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /\.(jpg|jpeg|png)$/i.test(v);
        },
        message: (props) =>
          "Photo must be a valid image file (jpg, jpeg, png)",
      },
    },
    vehicleDetailPhoto: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /\.(jpg|jpeg|png)$/i.test(v);
        },
        message: (props) =>
          "Photo must be a valid image file (jpg, jpeg, png)",
      },
    },
    ownerDetailPhoto: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /\.(jpg|jpeg|png)$/i.test(v);
        },
        message: (props) =>
          "Photo must be a valid image file (jpg, jpeg, png)",
      },
    },
    renewalDetailPhoto: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /\.(jpg|jpeg|png)$/i.test(v);
        },
        message: (props) =>
          "Photo must be a valid image file (jpg, jpeg, png)",
      },
    },
    insurancePhoto: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /\.(jpg|jpeg|png)$/i.test(v);
        },
        message: (props) =>
          "Photo must be a valid image file (jpg, jpeg, png)",
      },
    },

    // KYC Status
    status: {
      type: String,
      enum: {
        values: [
          "not_submitted",
          "pending",
          "verified",
          "rejected",
          "needs_resubmission",
        ],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
    },
    rejectionReason: {
      type: String,
      required: function () {
        return ["rejected", "needs_resubmission"].includes(this.status);
      },
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
      unique: true,
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

// Pre-save middleware
DriverSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "verified") {
      this.verifiedAt = new Date();
    }
    if (!["rejected", "needs_resubmission"].includes(this.status)) {
      this.rejectionReason = undefined;
    }
  }
  next();
});

// Index for faster queries
DriverSchema.index({ user: 1 }, { unique: true });
DriverSchema.index({ status: 1 });
DriverSchema.index({ citizenshipNumber: 1 }, { unique: true });
DriverSchema.index({ licenseNumber: 1 }, { unique: true });

const DriverModel = mongoose.model("Driver", DriverSchema);

export default DriverModel;
