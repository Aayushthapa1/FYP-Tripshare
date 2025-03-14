// models/BookingModel.js

import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seatsBooked: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
    },
    // If you want to store price at booking time (in case trip changes later)
    // priceAtBooking: { type: Number },
    // If you want a snapshot of driver name, vehicle, etc., you can store them here too
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
