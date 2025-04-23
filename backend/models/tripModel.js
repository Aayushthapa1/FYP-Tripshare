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
    // New fields for ratings
    // Track which users have rated this trip
    passengerRatings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        hasRated: {
          type: Boolean,
          default: false
        },
        ratingId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Rating"
        }
      }
    ],
    // Aggregate rating metrics for this trip
    ratingMetrics: {
      averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      totalRatings: {
        type: Number,
        default: 0
      }
    },
    // Trip completion details
    completionDetails: {
      completedAt: Date,
      actualDepartureTime: String,
      actualArrivalTime: String,
      notes: String
    }
  },
  { timestamps: true }
);

// Add index for efficient querying
tripSchema.index({ "driver._id": 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ departureDate: 1 });

// Method to mark a trip as completed
tripSchema.methods.markAsCompleted = async function (completionDetails) {
  this.status = "completed";
  this.completionDetails = {
    ...completionDetails,
    completedAt: new Date()
  };

  // Initialize passenger rating entries
  this.passengerRatings = this.bookedSeats.map(userId => ({
    user: userId,
    hasRated: false
  }));

  // Add pending ratings to all passengers
  try {
    const User = mongoose.model("User");
    const passengers = await User.find({ _id: { $in: this.bookedSeats } });

    // Create a pending rating for each passenger
    const pendingRatingPromises = passengers.map(passenger =>
      passenger.addPendingRating("Trip", this._id, this.driver._id)
    );

    await Promise.all(pendingRatingPromises);
  } catch (error) {
    console.error("Error adding pending ratings to passengers:", error);
  }

  return this.save();
};

// Method to update rating metrics when a new rating is added
tripSchema.methods.updateRatingMetrics = async function () {
  try {
    const Rating = mongoose.model("Rating");

    // Calculate the average rating and total for this trip
    const result = await Rating.aggregate([
      {
        $match: {
          referenceId: this._id,
          referenceType: "Trip",
          status: "active"
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    if (result.length > 0) {
      this.ratingMetrics.averageRating = parseFloat(result[0].averageRating.toFixed(1));
      this.ratingMetrics.totalRatings = result[0].totalRatings;
    }

    return this.save();
  } catch (error) {
    console.error("Error updating trip rating metrics:", error);
    throw error;
  }
};

// Method to mark a user's rating status
tripSchema.methods.markUserRated = async function (userId, ratingId) {
  const passengerRating = this.passengerRatings.find(
    pr => pr.user.toString() === userId.toString()
  );

  if (passengerRating) {
    passengerRating.hasRated = true;
    passengerRating.ratingId = ratingId;
  } else {
    this.passengerRatings.push({
      user: userId,
      hasRated: true,
      ratingId
    });
  }

  return this.save();
};

const Trip = mongoose.models.Trip || mongoose.model("Trip", tripSchema);

export default Trip;