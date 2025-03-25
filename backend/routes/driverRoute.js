import express from "express"
import {
  savePersonalInformation,
  saveLicenseInformation,
  saveVehicleInformation,
  getAllDrivers,
  updateDriverVerification,
  submitKYC,
  getPendingKYC,
  getDriverKYCStatus,
} from "../controllers/driverController.js"
import DriverModel from "../models/driverModel.js" // Import the DriverModel

const router = express.Router()

// Personal Info
router.post("/personalinfo", savePersonalInformation)

// License Info
router.post("/licenseinfo", saveLicenseInformation)

// Vehicle Info
router.post("/vehicleinfo", saveVehicleInformation)

// (Optional) Submit KYC all at once
router.post("/kyc", submitKYC)

// Get all drivers
router.get("/drivers", getAllDrivers)

// Get driver by id
router.get("/drivers/:driverId", async (req, res) => {
  const { driverId } = req.params
  try {
    const driver = await DriverModel.findById(driverId)
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" })
    }
    res.json(driver) // or { driver } if you prefer
  } catch (error) {
    console.error("Error fetching driver:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get pending KYC
router.get("/kycpending", getPendingKYC)

// Update driver verification
router.put("/drivers/verify/:driverId", updateDriverVerification)

// Get KYC status for a specific user
router.get("/kyc/status/:userId", getDriverKYCStatus)

export default router

