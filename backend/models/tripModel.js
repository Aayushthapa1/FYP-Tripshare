import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    // Everything about the driver stored here
    driver: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
      },
    },
    departureLocation: {
      type: String,
      required: true,
    },
    destinationLocation: {
      type: String,
      required: true,
    },
    departureDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          // Must be strictly in the future
          return value > new Date();
        },
        message: "Departure date must be in the future",
      },
    },
    departureTime: {
      type: String,
      required: true,
      validate: {
        // Simple HH:MM (24-hour) format check
        validator: function (v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: "Invalid Time Format (must be HH:MM)",
      },
    },
    price: {
      type: Number,
      required: true,
      min: 0, // ensure non-negative
    },
    availableSeats: {
      type: Number,
      required: true,
    
    },
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "cancelled"],
      default: "scheduled",
    },
    description: {
      type: String,
      default: "",
    },
    // Extended vehicle details
    vehicleDetails: {
      vehicleType: {
        type: String,
        enum: ["car", "bike", "van", "auto", "other"],
        default: "car",
      },
      model: {
        type: String,
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
      plateNumber: {
        type: String,
        required: true,
      },
    },
    preferences: {
      smoking: {
        type: Boolean,
        default: false,
      },
      pets: {
        type: Boolean,
        default: false,
      },
      music: {
        type: Boolean,
        default: false,
      },
    },
    // Array of user IDs who have booked seats
    bookedSeats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
