import express from "express";
import {
  createBooking,
  getBookingDetails,
  getMyBookings,
  cancelBooking,
  acceptBooking,
  rejectBooking,
  completeBooking,
  getDriverPendingBookings,
  getDriverBookings
} from "../controllers/bookingController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// Fixed route endpoints must come BEFORE any routes with params
router.get("/pending", protectRoute, getDriverPendingBookings);
router.get("/all", protectRoute, getDriverBookings);
router.get("/my", protectRoute, getMyBookings);

// Create booking
router.post("/create", protectRoute, createBooking);

// Action routes with bookingId parameter
router.put("/cancel/:bookingId", protectRoute, cancelBooking); // Changed from PATCH to PUT
router.put("/accept/:bookingId", protectRoute, acceptBooking);
router.put("/reject/:bookingId", protectRoute, rejectBooking);
router.put("/complete/:bookingId", protectRoute, completeBooking);

// Get single booking details (must be after other specific routes)
router.get("/:bookingId", protectRoute, getBookingDetails);

export default router;