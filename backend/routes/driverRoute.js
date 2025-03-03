import express from 'express';
import {
  savePersonalInformation,
  saveLicenseInformation,
  saveVehicleInformation,
  getAllDrivers,
  updateDriverVerification,
  submitKYC,
  getPendingKYC,
} from '../controllers/driverController.js';

const router = express.Router();

// Save Personal Information
router.post('/personalinfo', savePersonalInformation);

// Save License Information
router.post('/licenseinfo', saveLicenseInformation);

// Save Vehicle Information
router.post('/vehicleinfo', saveVehicleInformation);

// Submit KYC
router.post('/kyc', submitKYC);

// Fetch all drivers
router.get('/drivers', getAllDrivers);

// Fetch pending KYC
router.get('/kycpending', getPendingKYC);

router.put('/drivers/:driverId/verify', updateDriverVerification); // Update verification status

export default router;