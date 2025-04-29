import express from "express";
import {
  submitRating,
  getDriverRatings,
  getUserRatings,
  getRatingById,
  moderateRating,
  getDriverRatingSummary,
} from "../controllers/ratingController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// Public routes
router.get("/getdriverratings/:driverId", getDriverRatings);
router.get("/getdriverratingsummary/:driverId/summary", getDriverRatingSummary);
router.get("/getrating/:ratingId", getRatingById);

// Protected routes (require authentication)
router.post("/submitrating", protectRoute, submitRating);
router.get("/getuserratings", protectRoute, getUserRatings);


// Admin routes
router.patch("/moderaterating/:ratingId", protectRoute, moderateRating);

export default router;