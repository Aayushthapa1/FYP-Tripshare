import mongoose from "mongoose";

const userModelSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "driver", "Admin"],
      required: true,
    },
    resetPasswordOTP: {
      type: String,
    },
    resetPasswordOTPExpires: {
      type: Date,
    },
    driverDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
    },
    // New fields for driver ratings
    driverRating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      },
      // Store category averages
      categoryAverages: {
        punctuality: { type: Number, default: 0 },
        cleanliness: { type: Number, default: 0 },
        comfort: { type: Number, default: 0 },
        drivingSkill: { type: Number, default: 0 },
        communication: { type: Number, default: 0 }
      },
      lastUpdated: {
        type: Date
      }
    },
    // Rides/trips that need rating by this user
    pendingRatings: [
      {
        referenceId: {
          type: mongoose.Schema.Types.ObjectId
        },
        referenceType: {
          type: String,
          enum: ["Trip", "Ride"]
        },
        driverId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        completedAt: {
          type: Date
        }
      }
    ]
  },
  { timestamps: true }
);

// Method to update driver rating stats
userModelSchema.methods.updateDriverRatingStats = async function () {
  try {
    const Rating = mongoose.model('Rating');

    // Calculate overall stats
    const stats = await Rating.calculateDriverRating(this._id);

    // Calculate category averages
    const categoryStats = await Rating.aggregate([
      { $match: { driverId: this._id, status: "active" } },
      {
        $group: {
          _id: null,
          punctuality: { $avg: "$categoryRatings.punctuality" },
          cleanliness: { $avg: "$categoryRatings.cleanliness" },
          comfort: { $avg: "$categoryRatings.comfort" },
          drivingSkill: { $avg: "$categoryRatings.drivingSkill" },
          communication: { $avg: "$categoryRatings.communication" }
        }
      }
    ]);

    // Update the user document
    this.driverRating.average = stats.averageRating;
    this.driverRating.count = stats.totalRatings;
    this.driverRating.lastUpdated = new Date();

    // Update category averages if available
    if (categoryStats.length > 0) {
      this.driverRating.categoryAverages = {
        punctuality: categoryStats[0].punctuality || 0,
        cleanliness: categoryStats[0].cleanliness || 0,
        comfort: categoryStats[0].comfort || 0,
        drivingSkill: categoryStats[0].drivingSkill || 0,
        communication: categoryStats[0].communication || 0
      };
    }

    return this.save();
  } catch (error) {
    console.error("Error updating driver rating stats:", error);
    throw error;
  }
};

// Method to add a pending rating
userModelSchema.methods.addPendingRating = async function (referenceType, referenceId, driverId) {
  this.pendingRatings.push({
    referenceType,
    referenceId,
    driverId,
    completedAt: new Date()
  });

  return this.save();
};

// Method to remove a pending rating
userModelSchema.methods.removePendingRating = async function (referenceType, referenceId) {
  this.pendingRatings = this.pendingRatings.filter(
    item => !(item.referenceType === referenceType && item.referenceId.toString() === referenceId.toString())
  );

  return this.save();
};

const UserModel = mongoose.models.User || mongoose.model("User", userModelSchema);

export default UserModel;