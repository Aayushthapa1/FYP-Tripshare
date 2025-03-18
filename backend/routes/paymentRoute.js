import express from "express";
import { createPayment, getPaymentDetails, getAllPayments } from "../controllers/paymentController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// Create a payment (Protected)
router.post("/", protectRoute, createPayment);

// Get a single payment details (Protected)
router.get("/:paymentId", protectRoute, getPaymentDetails);

// Get all payments for logged-in user (Protected)
router.get("/", protectRoute, getAllPayments);

export default router;
