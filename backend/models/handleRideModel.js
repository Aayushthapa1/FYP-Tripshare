import mongoose from "mongoose";

const RideSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Not required initially as rides can be requested before driver assignment
    },
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required:"false",
    },
    pickupLocation: {
      type: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
      },
      required: [true, "Pickup location coordinates are required"]
    },
    dropoffLocation: {
      type: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
      },
      required: [true, "Dropoff location coordinates are required"]
    },
    pickupLocationName: {
      type: String,
      required: [true, "Pickup location name is required"],
      trim: true
    },
    dropoffLocationName: {
      type: String,
      required: [true, "Dropoff location name is required"],
      trim: true
    },
    distance: {
      type: Number,
      min: [0, "Distance cannot be negative"],
      required: [true, "Distance is required"]
    },
    estimatedTime: {
      type: Number,
      min: [0, "Estimated time cannot be negative"],
      required: [true, "Estimated time is required"]
    },
    fare: {
      type: Number,
      min: [0, "Fare cannot be negative"]
    },
    vehicleType: {
      type: String,
      enum: {
        values: ["Bike", "Car", "Electric"],
        message: "Vehicle type must be Bike, Car, or Electric"
      },
      required: [true, "Vehicle type is required"]
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ["cash", "card", "wallet"],
        message: "Payment method must be cash, card, or wallet"
      },
      default: "cash"
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "completed"],
        message: "Payment status must be pending or completed"
      },
      default: "pending"
    },
    status: {
      type: String,
      enum: {
        values: [
          "requested",
          "accepted",
          "picked up",
          "completed",
          "canceled",
          "rejected"
        ],
        message: "Invalid ride status"
      },
      default: "requested"
    },
    cancelReason: {
      type: String,
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add index for faster queries
RideSchema.index({ passengerId: 1, status: 1 });
RideSchema.index({ driverId: 1, status: 1 });
RideSchema.index({ createdAt: -1 });

// Virtual for calculating time elapsed since ride request
RideSchema.virtual('elapsedTime').get(function () {
  return Math.round((Date.now() - this.createdAt) / 1000 / 60); // in minutes
});

// Pre-save middleware to ensure consistent data
RideSchema.pre('save', function (next) {
  // Ensure completed rides have payment status set
  if (this.status === 'completed' && this.isModified('status')) {
    // If ride is marked as completed, ensure fare is calculated
    if (!this.fare) {
      // This is a fallback - fare should be set explicitly
      const baseFare = this.vehicleType === 'Bike' ? 50 :
        this.vehicleType === 'Car' ? 100 : 80;
      const ratePerKm = this.vehicleType === 'Bike' ? 15 :
        this.vehicleType === 'Car' ? 30 : 25;
      this.fare = Math.round(baseFare + this.distance * ratePerKm);
    }
  }
  next();
});

const Ride = mongoose.models.Ride || mongoose.model("Ride", RideSchema);
export default Ride;