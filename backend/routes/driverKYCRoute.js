import express from "express";
import {
  createDriver,
  getDrivers,
  getDriverById,
  getDriverByUser,
  updateDriver,
  deleteDriver,
  updateDriverStatus,
} from "../controllers/driverKYCController.js";

import { upload } from "../config/fileUpload.js";

const router = express.Router();

// Multer config: parse multiple fields for photos
const driverUpload = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "frontPhoto", maxCount: 1 },
  { name: "backPhoto", maxCount: 1 },
  { name: "vehiclePhoto", maxCount: 1 },
]);

// Driver routes
router.post("/create",  createDriver);
router.get("/user/:userId", getDriverByUser);
router.put("/update/:id", driverUpload, updateDriver);

// Admin routes
router.get("/all", getDrivers); // fetch all KYC
router.get("/:id", getDriverById);
router.put("/:id/status", updateDriverStatus);
router.delete("/delete/:id", deleteDriver);

export default router;
  