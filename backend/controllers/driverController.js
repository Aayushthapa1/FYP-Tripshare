// controllers/driverController.js

import upload from "../config/multerConfig.js";
import nodemailer from "nodemailer";
import DriverModel from "../models/driverModel.js";

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Save Personal Information
 */
// controllers/driverController.js
export const savePersonalInformation = async (req, res) => {
  upload.single("photo")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { fullName, address, email, gender, dob, citizenshipNumber, userId } = req.body;

    if (!fullName || !address || !email || !gender || !dob || !citizenshipNumber || !req.file || !userId) {
      return res.status(400).json({
        message: "All fields are required, including the photo and user ID.",
      });
    }

    const photo = `/uploads/${req.file.filename}`;

    try {
      // Check if the email or citizenship number already exists
      const existingDriver = await DriverModel.findOne({
        $or: [{ email }, { citizenshipNumber }],
      });
      if (existingDriver) {
        return res
          .status(400)
          .json({ message: "Email or Citizenship Number already exists." });
      }

      // Create a new driver record
      const driver = await DriverModel.create({
        fullName,
        address,
        email,
        gender,
        dob,
        citizenshipNumber,
        photo,
        user: userId,
        status: "pending",
      });

      return res.status(201).json({
        message: "Personal information saved successfully.",
        driver,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Something went wrong.", error: error.message });
    }
  });
};


/**
 * Save License Information
 */
export const saveLicenseInformation = async (req, res) => {
  // Multiple file fields: frontPhoto and backPhoto
  upload.fields([
    { name: "frontPhoto", maxCount: 1 },
    { name: "backPhoto", maxCount: 1 },
  ])(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    // Extract form data AFTER uploading
    const { licenseNumber, driverId } = req.body;
    const frontPhoto = req.files?.frontPhoto?.[0]?.filename;
    const backPhoto = req.files?.backPhoto?.[0]?.filename;

    if (!licenseNumber || !frontPhoto || !backPhoto || !driverId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    try {
      // Check if a different driver already uses this license number
      const existingLicense = await DriverModel.findOne({ licenseNumber });
      if (existingLicense && existingLicense._id.toString() !== driverId) {
        return res
          .status(400)
          .json({ message: "License Number already exists." });
      }

      // Find the driver
      const driver = await DriverModel.findById(driverId);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found." });
      }

      // If the driver is already verified, do not overwrite
      if (driver.status === "verified") {
        return res
          .status(400)
          .json({ message: "This driver is already verified. Cannot update license." });
      }

      // Update license info
      driver.licenseNumber = licenseNumber;
      driver.frontPhoto = `/uploads/${frontPhoto}`;
      driver.backPhoto = `/uploads/${backPhoto}`;
      await driver.save();

      return res.status(200).json({
        message: "License information saved successfully.",
        driver,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Something went wrong.", error: error.message });
    }
  });
};

/**
 * Save Vehicle Information
 */
export const saveVehicleInformation = async (req, res) => {
  // Multiple file fields: vehiclePhoto, vehicleDetailPhoto, ownerDetailPhoto, renewalDetailPhoto
  upload.fields([
    { name: "vehiclePhoto", maxCount: 1 },
    { name: "vehicleDetailPhoto", maxCount: 1 },
    { name: "ownerDetailPhoto", maxCount: 1 },
    { name: "renewalDetailPhoto", maxCount: 1 },
  ])(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { vehicleType, numberPlate, productionYear, driverId } = req.body;
    const vehiclePhoto = req.files?.vehiclePhoto?.[0]?.filename;
    const vehicleDetailPhoto = req.files?.vehicleDetailPhoto?.[0]?.filename;
    const ownerDetailPhoto = req.files?.ownerDetailPhoto?.[0]?.filename;
    const renewalDetailPhoto = req.files?.renewalDetailPhoto?.[0]?.filename;

    if (
      !vehicleType ||
      !numberPlate ||
      !productionYear ||
      !vehiclePhoto ||
      !vehicleDetailPhoto ||
      !ownerDetailPhoto ||
      !renewalDetailPhoto ||
      !driverId
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    try {
      // Find the driver by ID
      const driver = await DriverModel.findById(driverId);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found." });
      }

      // If the driver is already verified, do not overwrite
      if (driver.status === "verified") {
        return res
          .status(400)
          .json({ message: "This driver is already verified. Cannot update vehicle info." });
      }

      // Update vehicle info
      driver.vehicleType = vehicleType;
      driver.numberPlate = numberPlate;
      driver.productionYear = productionYear;
      driver.vehiclePhoto = `/uploads/${vehiclePhoto}`;
      driver.vehicleDetailPhoto = `/uploads/${vehicleDetailPhoto}`;
      driver.ownerDetailPhoto = `/uploads/${ownerDetailPhoto}`;
      driver.renewalDetailPhoto = `/uploads/${renewalDetailPhoto}`;

      await driver.save();

      return res.status(200).json({
        message: "Vehicle information saved successfully.",
        driver,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Something went wrong.", error: error.message });
    }
  });
};

/**
 * Submit KYC (Optional single endpoint)
 */
export const submitKYC = async (req, res) => {
  try {
    const { userId, ...kycData } = req.body;

    // Check if the driver already exists
    const existingDriver = await DriverModel.findOne({ user: userId });
    if (existingDriver) {
      return res.status(400).json({ message: "KYC already submitted." });
    }

    // Create a new driver record
    const driver = await DriverModel.create({
      ...kycData,
      user: userId,
      status: "pending",
    });

    return res.status(201).json({
      message: "KYC submitted successfully.",
      driver,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong.", error: error.message });
  }
};

/**
 * Get all Drivers
 */
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await DriverModel.find().populate("user");
    return res.status(200).json(drivers);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong.", error: error.message });
  }
};

/**
 * Get Pending KYC (Admin side)
 */
export const getPendingKYC = async (req, res) => {
  try {
    const pendingKYCs = await DriverModel.find({ status: "pending" }).populate("user");
    return res.status(200).json(pendingKYCs);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch pending KYC requests.",
      error: error.message,
    });
  }
};

/**
 * Update Driver Verification
 */
export const updateDriverVerification = async (req, res) => {
  const { driverId } = req.params;
  const { status, rejectionReason } = req.body;

  try {
    const driver = await DriverModel.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        StatusCode: 404,
        IsSuccess: false,
        ErrorMessage: ["Driver not found."],
        Result: null,
      });
    }

    // If already verified, do not overwrite
    if (driver.status === "verified") {
      return res.status(400).json({
        StatusCode: 400,
        IsSuccess: false,
        ErrorMessage: ["This driver is already verified."],
        Result: null,
      });
    }

    driver.status = status;
    driver.rejectionReason =
      status === "rejected" || status === "needs_resubmission"
        ? rejectionReason
        : undefined;

    await driver.save();

    // Send email notification (optional)
    try {
      const mailOptions = {
        from: process.env.EMAIL,
        to: driver.email,
        subject: "KYC Verification Status",
        text: `Dear ${driver.fullName},\n\nYour KYC application has been ${status}.\n\n${rejectionReason ? `Reason: ${rejectionReason}\n\n` : ""
          }Thank you for your application.\n\nBest regards,\nThe Team`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error("Error sending email:", error);
        }
      });
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
      // Continue even if email fails
    }

    return res.status(200).json({
      StatusCode: 200,
      IsSuccess: true,
      ErrorMessage: [],
      Result: {
        message: `Driver KYC ${status} successfully.`,
        driver,
      },
    });
  } catch (error) {
    console.error("Error updating driver verification:", error);
    return res.status(500).json({
      StatusCode: 500,
      IsSuccess: false,
      ErrorMessage: ["Something went wrong.", error.message],
      Result: null,
    });
  }
};
