import express from "express";
import {
  createTrip,
  getAllTrips,
  getDriverTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  searchTrips,
  getDriverTripStats,
 
} from "../controllers/tripController.js";
import protectRoute from "../middlewares/protectRoute.js";
import { authorizeRole } from "../middlewares/roleAuth.js";

const router = express.Router();

const validateSearchParams = (req, res, next) => {
  const { availableSeats } = req.query;
  if (availableSeats && isNaN(availableSeats)) {
    return res
      .status(400)
      .json({ error: "availableSeats must be a number" });
  }
  next();
};

// Create trip (driver only)
router.post("/create", protectRoute, authorizeRole("driver"), createTrip);


// List all trips (public)
router.get("/all", getAllTrips);

// Search trips (public)
router.get("/search", validateSearchParams, searchTrips);

// Driver statistics routes (driver only)
router.get("/stats", protectRoute, authorizeRole("driver"), getDriverTripStats);


// My trips (driver only)
router.get("/my-trips", protectRoute, authorizeRole("driver"), getDriverTrips);

// Single trip (public)
router.get("/:tripId", getTripById);

// Update trip (driver only)
router.put("/:tripId", protectRoute, authorizeRole("driver"), updateTrip);

// Delete trip (driver only)
router.delete("/:tripId", protectRoute, authorizeRole("driver"), deleteTrip);

export default router;
