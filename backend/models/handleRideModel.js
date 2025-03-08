import mongoose from "mongoose";

const RideSchema = new mongoose.Schema(
  {
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    pickupLocationName: { type: String, required: true },
    dropoffLocationName: { type: String, required: true },
    distance: { type: Number },
    estimatedTime: { type: Number },
    status: {
      type: String,
      enum: ["available", "requested", "accepted", "picked up", "completed", "canceled"],
      default: "requested",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Ride", RideSchema);
