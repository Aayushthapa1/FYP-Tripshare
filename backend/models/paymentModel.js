import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: function() {
        // Only require booking if payment is completed and not for trip type
        return this.status === "completed" && this.bookingType !== "trip";
      }
    },
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: function() {
        return this.bookingType === "trip";
      }
    },
    seats: {
      type: Number,
      required: function() {
        return this.bookingType === "trip";
      },
      min: 1
    },
    bookingType: {
      type: String,
      enum: ["trip", "appointment"],
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["esewa", "khalti", "bank_transfer", "COD"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "canceled"],
      default: "pending",
    },
    transactionId: {
      type: String,
      default: null
    },
    khaltiToken: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;