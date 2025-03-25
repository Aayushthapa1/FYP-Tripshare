import DriverModel from "../models/driverModel.js"
import { uploadToCloudinary } from "../config/cloudinaryConfig.js" 

// Save Personal Information
export const savePersonalInformation = async (req, res) => {
  try {
    console.log("savePersonalInformation request body:", req.body)
    console.log("savePersonalInformation request files:", req.files)
    console.log("savePersonalInformation request query:", req.query)
    console.log("savePersonalInformation request params:", req.params)

    // Try to get userId from various places
    const userId = req.body.userId || req.query.userId || (req.params && req.params.userId)

    console.log("Extracted userId:", userId)

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      })
    }

    // Extract other fields with fallbacks
    const fullName = req.body.fullName || ""
    const address = req.body.address || ""
    const email = req.body.email || ""
    const gender = req.body.gender || "Other"
    const dob = req.body.dob || new Date().toISOString().split("T")[0]
    const citizenshipNumber = req.body.citizenshipNumber || ""

    // Handle photo upload
    let photoUrl = ""
    if (req.files && req.files.photo) {
      try {
        photoUrl = await uploadToCloudinary(req.files.photo.tempFilePath)
      } catch (uploadError) {
        console.error("Error uploading photo to Cloudinary:", uploadError)
        return res.status(500).json({
          success: false,
          message: "Failed to upload photo",
          error: uploadError.message,
        })
      }
    }

    // Check if driver profile already exists for this user
    let driver = await DriverModel.findOne({ user: userId })

    if (driver) {
      // Update existing driver profile
      driver.fullName = fullName
      driver.address = address
      driver.email = email
      driver.gender = gender
      driver.dob = new Date(dob)
      driver.citizenshipNumber = citizenshipNumber
      if (photoUrl) driver.photo = photoUrl

      await driver.save()
    } else {
      // Create new driver profile
      driver = new DriverModel({
        fullName,
        address,
        email,
        gender,
        dob: new Date(dob),
        citizenshipNumber,
        photo: photoUrl,
        user: userId,
        status: "pending",
      })

      await driver.save()
    }

    return res.status(200).json({
      success: true,
      message: "Personal information saved successfully",
      driver,
    })
  } catch (error) {
    console.error("Error saving personal information:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to save personal information",
      error: error.message,
    })
  }
}

// Save License Information
export const saveLicenseInformation = async (req, res) => {
  try {
    console.log("saveLicenseInformation request body:", req.body)
    console.log("saveLicenseInformation request files:", req.files)
    console.log("saveLicenseInformation request query:", req.query)

    // Try to get userId from various places
    const userId = req.body.userId || req.query.userId || (req.params && req.params.userId)

    console.log("Extracted userId:", userId)

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      })
    }

    // Extract licenseNumber with fallback
    const licenseNumber = req.body.licenseNumber || ""

    // Handle license photo uploads
    let frontPhotoUrl = ""
    let backPhotoUrl = ""

    if (req.files) {
      if (req.files.frontPhoto) {
        frontPhotoUrl = await uploadToCloudinary(req.files.frontPhoto.tempFilePath)
      }
      if (req.files.backPhoto) {
        backPhotoUrl = await uploadToCloudinary(req.files.backPhoto.tempFilePath)
      }
    }

    // Find driver by user ID
    const driver = await DriverModel.findOne({ user: userId })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found. Please complete personal information first.",
      })
    }

    // Update license information
    driver.licenseNumber = licenseNumber
    if (frontPhotoUrl) driver.frontPhoto = frontPhotoUrl
    if (backPhotoUrl) driver.backPhoto = backPhotoUrl

    // Update status to pending if it was previously rejected
    if (driver.status === "rejected" || driver.status === "needs_resubmission") {
      driver.status = "pending"
    }

    await driver.save()

    return res.status(200).json({
      success: true,
      message: "License information saved successfully",
      driver,
    })
  } catch (error) {
    console.error("Error saving license information:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to save license information",
      error: error.message,
    })
  }
}

// Save Vehicle Information
export const saveVehicleInformation = async (req, res) => {
  try {
    console.log("saveVehicleInformation request body:", req.body)
    console.log("saveVehicleInformation request files:", req.files)
    console.log("saveVehicleInformation request query:", req.query)

    // Try to get userId from various places
    const userId = req.body.userId || req.query.userId || (req.params && req.params.userId)

    console.log("Extracted userId:", userId)

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      })
    }

    // Extract fields with fallbacks
    const vehicleType = req.body.vehicleType || "Car"
    const numberPlate = req.body.numberPlate || ""
    const productionYear = req.body.productionYear || ""

    // Handle vehicle photo uploads
    let vehiclePhotoUrl = ""
    let vehicleDetailPhotoUrl = ""
    let ownerDetailPhotoUrl = ""
    let renewalDetailPhotoUrl = ""

    if (req.files) {
      if (req.files.vehiclePhoto) {
        vehiclePhotoUrl = await uploadToCloudinary(req.files.vehiclePhoto.tempFilePath)
      }
      if (req.files.vehicleDetailPhoto) {
        vehicleDetailPhotoUrl = await uploadToCloudinary(req.files.vehicleDetailPhoto.tempFilePath)
      }
      if (req.files.ownerDetailPhoto) {
        ownerDetailPhotoUrl = await uploadToCloudinary(req.files.ownerDetailPhoto.tempFilePath)
      }
      if (req.files.renewalDetailPhoto) {
        renewalDetailPhotoUrl = await uploadToCloudinary(req.files.renewalDetailPhoto.tempFilePath)
      }
    }

    // Find driver by user ID
    const driver = await DriverModel.findOne({ user: userId })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver profile not found. Please complete personal information first.",
      })
    }

    // Update vehicle information
    driver.vehicleType = vehicleType
    driver.numberPlate = numberPlate
    driver.productionYear = productionYear
    if (vehiclePhotoUrl) driver.vehiclePhoto = vehiclePhotoUrl
    if (vehicleDetailPhotoUrl) driver.vehicleDetailPhoto = vehicleDetailPhotoUrl
    if (ownerDetailPhotoUrl) driver.ownerDetailPhoto = ownerDetailPhotoUrl
    if (renewalDetailPhotoUrl) driver.renewalDetailPhoto = renewalDetailPhotoUrl

    // Update status to pending if it was previously rejected
    if (driver.status === "rejected" || driver.status === "needs_resubmission") {
      driver.status = "pending"
    }

    await driver.save()

    return res.status(200).json({
      success: true,
      message: "Vehicle information saved successfully",
      driver,
    })
  } catch (error) {
    console.error("Error saving vehicle information:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to save vehicle information",
      error: error.message,
    })
  }
}

// Submit KYC (all information at once)
export const submitKYC = async (req, res) => {
  try {
    console.log("submitKYC request body:", req.body)
    console.log("submitKYC request files:", req.files)
    console.log("submitKYC request query:", req.query)
    console.log("submitKYC request params:", req.params)

    // Try to get userId from various places
    const userId = req.body.userId || req.query.userId || (req.params && req.params.userId)

    console.log("Extracted userId:", userId)

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      })
    }

    // Extract fields with fallbacks
    const fullName = req.body.fullName || ""
    const address = req.body.address || ""
    const email = req.body.email || ""
    const gender = req.body.gender || "Other"
    const dob = req.body.dob || new Date().toISOString().split("T")[0]
    const citizenshipNumber = req.body.citizenshipNumber || ""
    const licenseNumber = req.body.licenseNumber || ""
    const vehicleType = req.body.vehicleType || "Car"
    const numberPlate = req.body.numberPlate || ""
    const productionYear = req.body.productionYear || ""

    // Handle all photo uploads
    const photoUrls = {}
    const requiredPhotos = [
      "photo",
      "frontPhoto",
      "backPhoto",
      "vehiclePhoto",
      "vehicleDetailPhoto",
      "ownerDetailPhoto",
      "renewalDetailPhoto",
    ]

    if (req.files) {
      for (const field of requiredPhotos) {
        if (req.files[field]) {
          photoUrls[field] = await uploadToCloudinary(req.files[field].tempFilePath)
        }
      }
    }

    // Check if driver profile already exists
    let driver = await DriverModel.findOne({ user: userId })

    if (driver) {
      // Update existing driver
      driver.fullName = fullName
      driver.address = address
      driver.email = email
      driver.gender = gender
      driver.dob = new Date(dob)
      driver.citizenshipNumber = citizenshipNumber
      driver.licenseNumber = licenseNumber
      driver.vehicleType = vehicleType
      driver.numberPlate = numberPlate
      driver.productionYear = productionYear

      // Update photos if provided
      for (const [field, url] of Object.entries(photoUrls)) {
        driver[field] = url
      }

      // Reset status to pending if resubmitting
      driver.status = "pending"
      driver.rejectionReason = null
    } else {
      // Create new driver with all information
      driver = new DriverModel({
        fullName,
        address,
        email,
        gender,
        dob: new Date(dob),
        citizenshipNumber,
        licenseNumber,
        vehicleType,
        numberPlate,
        productionYear,
        user: userId,
        status: "pending",
        ...photoUrls,
      })
    }

    await driver.save()

    return res.status(200).json({
      success: true,
      message: "KYC information submitted successfully",
      driver,
    })
  } catch (error) {
    console.error("Error submitting KYC:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to submit KYC information",
      error: error.message,
    })
  }
}

// Get All Drivers
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await DriverModel.find().populate("user", "username email")

    return res.status(200).json({
      success: true,
      count: drivers.length,
      drivers,
    })
  } catch (error) {
    console.error("Error fetching drivers:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch drivers",
      error: error.message,
    })
  }
}

// Get Pending KYC Submissions
export const getPendingKYC = async (req, res) => {
  try {
    const pendingDrivers = await DriverModel.find({ status: "pending" }).populate("user", "username email")

    return res.status(200).json({
      success: true,
      count: pendingDrivers.length,
      drivers: pendingDrivers,
    })
  } catch (error) {
    console.error("Error fetching pending KYC submissions:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending KYC submissions",
      error: error.message,
    })
  }
}

// Update Driver Verification Status
export const updateDriverVerification = async (req, res) => {
  try {
    const { driverId } = req.params
    const { status, rejectionReason } = req.body

    // Validate status
    const validStatuses = ["pending", "verified", "rejected", "needs_resubmission"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      })
    }

    // Find driver by ID
    const driver = await DriverModel.findById(driverId)

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      })
    }

    // Update status
    driver.status = status

    // Add rejection reason if status is rejected or needs_resubmission
    if (status === "rejected" || status === "needs_resubmission") {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required when rejecting or requesting resubmission",
        })
      }
      driver.rejectionReason = rejectionReason
    } else {
      driver.rejectionReason = null
    }

    await driver.save()

    return res.status(200).json({
      success: true,
      message: `Driver verification status updated to ${status}`,
      driver,
    })
  } catch (error) {
    console.error("Error updating driver verification:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to update driver verification status",
      error: error.message,
    })
  }
}

// Get Driver KYC Status by User ID
export const getDriverKYCStatus = async (req, res) => {
  try {
    const { userId } = req.params

    const driver = await DriverModel.findOne({ user: userId })

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "No KYC information found for this user",
      })
    }

    return res.status(200).json({
      success: true,
      status: driver.status,
      rejectionReason: driver.rejectionReason,
      driver,
    })
  } catch (error) {
    console.error("Error fetching KYC status:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch KYC status",
      error: error.message,
    })
  }
}

