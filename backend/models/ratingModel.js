import mongoose from "mongoose"

const ratingSchema = new mongoose.Schema(
  {
    // Reference to the booking that is being rated
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    // User who submitted the rating (passenger)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Driver who is being rated
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Reference to the trip associated with this rating
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    // The actual rating value (1-5 stars)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Optional text feedback from the user
    feedback: {
      type: String,
      default: "",
    },

    // Status for soft deletion
    status: {
      type: String,
      enum: ["active", "deleted"],
      default: "active",
    },
  },
  { timestamps: true }, // Automatically add createdAt and updatedAt fields
)

// Ensure a user can only rate a booking once
ratingSchema.index({ booking: 1, user: 1 }, { unique: true })

// Create a compound index for efficient driver rating queries
ratingSchema.index({ driver: 1, status: 1 })

const Rating = mongoose.models.Rating || mongoose.model("Rating", ratingSchema)

export default Rating

