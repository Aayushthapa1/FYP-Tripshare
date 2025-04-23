// bookingModel.js

import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    trip: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seatsBooked: { type: Number, default: 1, min: 1 },
    // Updated status enum to include "pending" status
    status: {
      type: String,
      enum: ["pending", "booked", "cancelled", "completed"],
      default: "pending"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "online"],
      required: true
    },
    // New field to store reason if driver rejects booking
    rejectionReason: {
      type: String,
      default: ""
    },
    // New field to store completion time
    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;