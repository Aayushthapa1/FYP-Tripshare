import express from "express";
import {
  createBooking,
  getBookingDetails,
  getMyBookings,
  cancelBooking,
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

export default router;
