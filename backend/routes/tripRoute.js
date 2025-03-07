import express from "express";
import {
  createTrip,
  getAllTrips,
  getDriverTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  searchTrips,
} from "../controllers/tripController.js";
import protectRoute from "../middlewares/protectRoute.js";
import { authorizeRole } from "../middlewares/roleAuth.js";

const router = express.Router();

// Create a trip (only drivers can create trips)
router.post("/create",  createTrip);

// Get all trips (public route)
router.get("/all", getAllTrips);

// Search trips (public route)
router.get("/search", searchTrips);

// Get driver's trips (driver only)
router.get("/my-trips", protectRoute, authorizeRole("driver"), getDriverTrips);

// Get single trip
router.get("/:tripId", getTripById);

// Update trip (driver only)
router.put("/:tripId", updateTrip);

// Delete trip (driver only)
router.delete("/:tripId",  deleteTrip);

export default router;