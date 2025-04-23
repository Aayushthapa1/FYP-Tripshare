import express from "express";
import {
  submitRating,
  getDriverRatings,
  getUserRatings,
  getRatingById,
  updateRating,
  deleteRating,
  moderateRating,
  getDriverRatingSummary
} from "../controllers/ratingController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// Public routes
router.get("/driver/:driverId", getDriverRatings);
router.get("/driver/:driverId/summary", getDriverRatingSummary);
router.get("/:ratingId", getRatingById);

// Protected routes (require authentication)
router.post("/submit", protectRoute, submitRating);
router.get("/user/me", protectRoute, getUserRatings);
router.put("/update/:ratingId", protectRoute, updateRating);
router.delete("/delete/:ratingId", protectRoute, deleteRating);

// Admin routes
router.patch("/moderate/:ratingId", protectRoute,  moderateRating);

export default router;