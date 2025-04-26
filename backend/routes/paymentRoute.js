import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {
   initiatePayment,
   completeKhaltiPayment,
   getPaymentDetails,
   getAllPayments,
   getUserPayments,
   getDriverPayments,
   getAdminPaymentStats
} from "../controllers/paymentController.js";

const router = express.Router();

// Payment initiation route
router.post("/initiate", protectRoute, initiatePayment);

// User routes - must be protected to get user from req.user
router.get("/getuserpayments", protectRoute, getUserPayments);

// Driver routes - must be protected to get driver from req.user
router.get("/getdriverpayments", protectRoute, getDriverPayments);

// Khalti callback route (public - called by Khalti)
router.get("/completeKhaltiPayment", completeKhaltiPayment);

// Get specific payment details - protected route
router.get("/getpaymentdetails/:paymentId", protectRoute, getPaymentDetails);

// Admin routes - protected routes
router.get("/admin/paymentstats", protectRoute, getAdminPaymentStats);
router.get("/admin/allpayments", protectRoute, getAllPayments);

export default router;