
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
router.get("/user", getUserPayments);

// Driver routes
router.get("/driver", getDriverPayments);


// Khalti callback route (public - called by Khalti)
router.get("/completeKhaltiPayment", completeKhaltiPayment);


// Get specific payment details
router.get("/:paymentId", protectRoute, getPaymentDetails);


// Admin routes
router.get("/admin/stats",  getAdminPaymentStats);
router.get("/admin/all",  getAllPayments);
export default router;


