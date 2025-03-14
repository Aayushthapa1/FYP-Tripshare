import express from "express";
import {
  createBooking,
  getBookingDetails,
  getMyBookings,
  cancelBooking,
} from "../controllers/bookingController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// CREATE booking
router.post("/", protectRoute, createBooking);

// GET my bookings
router.get("/my", protectRoute, getMyBookings);

// GET single booking details
router.get("/:bookingId", protectRoute, getBookingDetails);

// CANCEL booking
router.patch("/:bookingId/cancel", protectRoute, cancelBooking);

export default router;
