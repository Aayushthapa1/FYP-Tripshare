import express from "express";
import {
    submitRating,
    getDriverRatings,
    getUserRatings,
    deleteRating,
    updateRating,
    getRatingStats
} from "../controllers/ratingController.js";
import protectRoute from "../middlewares/validateRequest.js";
import { authorizeRole } from "../middlewares/roleAuth.js";
import Rating from "../models/ratingModel.js";
import { createResponse } from "../utils/responseHelper.js";

const router = express.Router();

// Submit a new rating - requires authentication
router.post("/submit", protectRoute, submitRating);

// Get ratings for a specific driver - public route
router.get("/driver/:driverId", getDriverRatings);

// Get ratings submitted by the authenticated user
router.get("/user", protectRoute, getUserRatings);

// Get rating statistics for a driver - public route
router.get("/stats/:driverId", getRatingStats);

// Delete a rating (soft delete) - requires authentication
router.delete("/delete/:ratingId", protectRoute, deleteRating);

// Update a rating - requires authentication
router.put("/update/:ratingId", protectRoute, updateRating);

// Admin routes
router.get("/admin/all", protectRoute, authorizeRole("admin"), async (req, res) => {
    // This route is for admin to see all ratings
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const ratings = await Rating.find()
            .populate("user", "fullName email")
            .populate("driver", "fullName email")
            .populate("trip", "departureLocation destinationLocation")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Rating.countDocuments();

        return res.status(200).json(
            createResponse(200, true, [], {
                ratings,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit)
                }
            })
        );
    } catch (error) {
        console.error("Error fetching all ratings:", error);
        return res.status(500).json(
            createResponse(500, false, ["Failed to fetch ratings"])
        );
    }
});

export default router;
