import express from "express";
import {
  createBooking,
  getBookingDetails,
  getMyBookings,
  cancelBooking,
  getChatUsers,
  // Add the new controller function
} from "../controllers/bookingController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// Create booking (protected)
router.post("/", protectRoute, createBooking);

// Get my bookings (protected)
router.get("/my", protectRoute, getMyBookings);

router.get("/getChatUsers", protectRoute, getChatUsers);
// Get single booking details (protected)
router.get("/getBookingDetails/:bookingId", protectRoute, getBookingDetails);

// Cancel booking (protected)
router.patch("/cancel/:bookingId/", protectRoute, cancelBooking);


// Confirm payment and initialize chat (protected)
// router.patch("/:bookingId/confirm-payment", protectRoute, confirmPayment);

export default router;