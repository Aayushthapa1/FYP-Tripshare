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
      required: true,
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
    // Enhanced rating fields
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      trim: true
    },
    // Added detailed rating information
    ratingDetails: {
      ratingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rating"
      },
      ratedAt: Date,
      ratingStatus: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
      },
      reminderSent: {
        type: Boolean,
        default: false
      },
      trafficCondition: {
        type: String,
        enum: ["light", "moderate", "heavy"],
        default: "light",
      },
    },
    // Completion details
    completionDetails: {
      completedAt: Date,
      actualTravelTime: Number, // in minutes
      notes: String
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

    // Set completion details if not already set
    if (!this.completionDetails) {
      this.completionDetails = {
        completedAt: new Date(),
        actualTravelTime: this.estimatedTime // Default to estimated time
      };
    }

    // Initialize rating details if not already set
    if (!this.ratingDetails) {
      this.ratingDetails = {
        ratingStatus: "pending",
        reminderSent: false
      };
    }

    // Add this ride to the passenger's pending ratings
    try {
      const User = mongoose.model("User");
      User.findById(this.passengerId).then(passenger => {
        if (passenger) {
          passenger.addPendingRating("Ride", this._id, this.driverId);
        }
      }).catch(err => console.error("Error adding pending rating:", err));
    } catch (error) {
      console.error("Error in pre-save hook:", error);
    }
  }
  next();
});

// Method to mark ride as rated
RideSchema.methods.markAsRated = async function (rating, feedback, ratingId) {
  this.rating = rating;
  this.feedback = feedback;

  this.ratingDetails = {
    ...this.ratingDetails,
    ratingId,
    ratedAt: new Date(),
    ratingStatus: "completed"
  };

  return this.save();
};

// Static method to find rides that need rating reminders
RideSchema.statics.findRidesNeedingRatingReminders = async function (daysThreshold = 3) {
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

  return this.find({
    status: "completed",
    "ratingDetails.ratingStatus": "pending",
    "ratingDetails.reminderSent": false,
    "completionDetails.completedAt": { $lt: thresholdDate }
  })
    .populate('passengerId', 'email fullName')
    .populate('driverId', 'fullName')
    .lean();
};

const Ride = mongoose.models.Ride || mongoose.model("Ride", RideSchema);
export default Ride;