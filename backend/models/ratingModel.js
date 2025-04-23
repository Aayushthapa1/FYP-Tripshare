import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    // The user who is giving the rating (passenger)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The driver who is being rated
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Reference to either Trip or Ride
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // Type of reference (Trip or Ride)
    referenceType: {
      type: String,
      enum: ["Trip", "Ride"],
      required: true,
    },
    // Rating (1-5 stars)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // Written review (optional)
    review: {
      type: String,
      trim: true,
    },
    // Specific rating categories
    categoryRatings: {
      punctuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      cleanliness: {
        type: Number,
        min: 1,
        max: 5,
      },
      comfort: {
        type: Number,
        min: 1,
        max: 5,
      },
      drivingSkill: {
        type: Number,
        min: 1,
        max: 5,
      },
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    // Status to handle potential flagging or moderation
    status: {
      type: String,
      enum: ["active", "flagged", "removed"],
      default: "active",
    },
    // Optional moderation details
    moderationDetails: {
      action: String,
      reason: String,
      moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      moderatedAt: Date
    }
  },
  { timestamps: true }
);

// Create indexes for efficient querying
ratingSchema.index({ driverId: 1 });
ratingSchema.index({ userId: 1 });
ratingSchema.index({ referenceId: 1, referenceType: 1, userId: 1 }, { unique: true });

// Virtual for calculating average of category ratings
ratingSchema.virtual('categoryAverage').get(function () {
  const categories = this.categoryRatings;
  let sum = 0;
  let count = 0;

  for (const key in categories) {
    if (categories[key]) {
      sum += categories[key];
      count++;
    }
  }

  return count > 0 ? (sum / count).toFixed(1) : null;
});

// Static method to calculate a driver's average rating
ratingSchema.statics.calculateDriverRating = async function (driverId) {
  const result = await this.aggregate([
    { $match: { driverId: new mongoose.Types.ObjectId(driverId), status: "active" } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? {
    averageRating: parseFloat(result[0].averageRating.toFixed(1)),
    totalRatings: result[0].totalRatings
  } : { averageRating: 0, totalRatings: 0 };
};

const Rating = mongoose.models.Rating || mongoose.model("Rating", ratingSchema);

export default Rating;