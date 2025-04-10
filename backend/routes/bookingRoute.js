import express from "express";
import {
  createBooking,
  getBookingDetails,
  getMyBookings,
  cancelBooking,
  // Add the new controller function
} from "../controllers/bookingController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// Create booking (protected)
router.post("/", protectRoute, createBooking);

// Get my bookings (protected)
router.get("/my", protectRoute, getMyBookings);

// Get single booking details (protected)
router.get("/:bookingId", protectRoute, getBookingDetails);

// Cancel booking (protected)
router.patch("/:bookingId/cancel", protectRoute, cancelBooking);

// Confirm payment and initialize chat (protected)
// router.patch("/:bookingId/confirm-payment", protectRoute, confirmPayment);

export default router;