//--------------------------------------------------------
// File: routes/driverKYCRoute.js
//--------------------------------------------------------
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

// If you are using multer to handle file uploads:
import { upload } from "../config/fileUpload.js";
// "upload" is your multer middleware instance. 
// Example: upload.fields([...]) to handle multiple fields

// If you have an auth or admin check, you can import them here
// import protectRoute from "../middlewares/protectRoute.js";
// import adminRoute from "../middlewares/adminRoute.js";

const router = express.Router();

// Submit new KYC (driver user)
router.post(
  "/",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "frontPhoto", maxCount: 1 },
    { name: "backPhoto", maxCount: 1 },
    { name: "vehiclePhoto", maxCount: 1 },
    { name: "vehicleDetailPhoto", maxCount: 1 },
    { name: "ownerDetailPhoto", maxCount: 1 },
    { name: "renewalDetailPhoto", maxCount: 1 },
    { name: "insurancePhoto", maxCount: 1 },
  ]),
  createDriver
);

// Get KYC by user
router.get("/user/:userId", getDriverByUser);

// Get single KYC
router.get("/:id", getDriverById);

// Update KYC (driver side re-submission)
router.put(
  "/:id",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "frontPhoto", maxCount: 1 },
    { name: "backPhoto", maxCount: 1 },
    { name: "vehiclePhoto", maxCount: 1 },
    { name: "vehicleDetailPhoto", maxCount: 1 },
    { name: "ownerDetailPhoto", maxCount: 1 },
    { name: "renewalDetailPhoto", maxCount: 1 },
    { name: "insurancePhoto", maxCount: 1 },
  ]),
  updateDriver
);

// Admin side
router.get("/", getDrivers); // Lists all KYC submissions
router.patch("/:id/status", updateDriverStatus); // Admin updates status
router.delete("/:id", deleteDriver); // Admin deletes

export default router;
