
import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {
   initiatePayment,
   completeKhaltiPayment,
   getPaymentDetails,
   getAllPayments
} from "../controllers/paymentController.js";


const router = express.Router();


// Payment initiation route
router.post("/initiate", protectRoute, initiatePayment);


// Khalti callback route (public - called by Khalti)
router.get("/completeKhaltiPayment", completeKhaltiPayment);


// Get specific payment details
router.get("/:paymentId", protectRoute, getPaymentDetails);


// Get all payments (admin only potentially)
router.get("/", protectRoute, getAllPayments);
export default router;


