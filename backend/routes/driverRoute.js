// routes/driverRoutes.js

import express from "express";
import {
  savePersonalInformation,
  saveLicenseInformation,
  saveVehicleInformation,
  getAllDrivers,
  updateDriverVerification,
  submitKYC,
  getPendingKYC,
  
} from "../controllers/driverController.js";

const router = express.Router();

// Personal Info
router.post("/personalinfo", savePersonalInformation);

// License Info
router.post("/licenseinfo", saveLicenseInformation);

// Vehicle Info
router.post("/vehicleinfo", saveVehicleInformation);

// (Optional) Submit KYC all at once
router.post("/kyc", submitKYC);

// Get all drivers
router.get("/drivers", getAllDrivers);

// Get driver by id
router.get('/drivers/:driverId', async (req, res) => {
  const { driverId } = req.params;
  const driver = await DriverModel.findById(driverId);
  res.json(driver); // or { driver } if you prefer
});

// Get pending KYC
router.get("/kycpending", getPendingKYC);

// Update driver verification
router.put("/drivers/verify/:driverId", updateDriverVerification);



export default router;
