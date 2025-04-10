import mongoose from "mongoose";
import DriverModel from "../models/driverKYCModel.js";
import { uploadToCloudinary } from "../config/cloudinaryConfig.js";
import { deleteCloudinaryAssets } from "../utils/cloudinaryCleanup.js";


export const createDriver = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ----- Debug Logging -----
    console.log("CREATE DRIVER KYC REQUEST BODY:", req.body);
    console.log("CREATE DRIVER KYC REQUEST FILES:", req.files);
    // If you're using "multer" + upload.fields([...]): 
    //   - `req.files` might be an object with photo, frontPhoto, backPhoto
    // If you're using "express-fileupload":
    //   - `req.files` might be an object with keys: photo, frontPhoto, etc.

    // Prepare the list of required fields
    const requiredFields = [
      "fullName",
      "address",
      "email",
      "gender",
      "dob",
      "citizenshipNumber",
      "photo",
      "licenseNumber",
      "licenseExpiryDate",
      "frontPhoto",
      "backPhoto",
      "user",
    ];

    // Check for missing text-based fields
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check for existing KYC for this user
    const existingDriver = await DriverModel.findOne({
      user: req.body.user,
    }).session(session);

    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: "User already has a KYC submission",
      });
    }

    // Validate license expiry
    const licenseExpiryDate = new Date(req.body.licenseExpiryDate);
    if (isNaN(licenseExpiryDate.getTime())) {
      // It's not a valid date
      return res.status(400).json({
        success: false,
        message: "Invalid licenseExpiryDate format",
      });
    }

    if (licenseExpiryDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "License is expired. Please provide a valid license.",
      });
    }

    // Validate DOB for minimum age (18)
    const dob = new Date(req.body.dob);
    if (isNaN(dob.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid dob format",
      });
    }

    const eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
    if (dob > eighteenYearsAgo) {
      return res.status(400).json({
        success: false,
        message: "Driver must be at least 18 years old",
      });
    }

    // (Optional) If you need to handle the actual file uploads, do so here:
    // e.g., if using Multer, you'd get `req.files.photo[0]` (if using upload.fields([...])).
    // Then you'd store the file path or upload it to Cloudinary.
    // For now, this code uses a string in req.body.photo, etc. as if the client is sending it.

    // Create new submission (status = "pending")
    const newDriver = new DriverModel({
      ...req.body,
      status: "pending",
    });

    const savedDriver = await newDriver.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Emit a Socket.IO event if available
    if (io) {
      io.emit("driver_kyc_submitted", {
        driverId: savedDriver._id,
        userId: savedDriver.user,
        message: "A new driver KYC submission has been created",
      });
    }

    return res.status(201).json({
      success: true,
      message: "KYC submission created successfully",
      data: savedDriver,
    });
  } catch (error) {
    // Log the full error stack to see what's happening
    console.error("CREATE DRIVER KYC ERROR:", error);

    await session.abortTransaction();
    session.endSession();

    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists. Please provide a unique value.`,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create KYC submission",
      error: error.message,
    });
  }
};

/**
 * GET ALL KYC SUBMISSIONS (with optional filters & pagination)
 */
export const getDrivers = async (req, res) => {
  try {
    const { status, sort, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const total = await DriverModel.countDocuments(filter);

    let sortOption = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(":");
      sortOption = { [field]: order === "desc" ? -1 : 1 };
    }

    const drivers = await DriverModel.find(filter)
      .populate("user", "name email phone")
      .populate("reviewedBy", "name email")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      count: drivers.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: drivers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch KYC submissions",
      error: error.message,
    });
  }
};

/**
 * GET SINGLE KYC SUBMISSION BY ID
 */
export const getDriverById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const driver = await DriverModel.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("reviewedBy", "name email");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "KYC submission not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch KYC submission",
      error: error.message,
    });
  }
};

/**
 * GET KYC STATUS FOR A SPECIFIC USER
 */
export const getDriverByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const driver = await DriverModel.findOne({ user: userId }).select(
      "status rejectionReason createdAt updatedAt verifiedAt"
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "No KYC submission found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch KYC status",
      error: error.message,
    });
  }
};

/**
 * UPDATE KYC INFORMATION (driver side re-submission)
 */
export const updateDriver = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const driver = await DriverModel.findById(req.params.id).session(session);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "KYC submission not found",
      });
    }

    // Prevent direct status changes here
    if (req.body.status) {
      return res.status(400).json({
        success: false,
        message: "Use the dedicated status endpoint for status updates",
      });
    }

    // Only allow updates if status is "pending", "needs_resubmission", or "rejected"
    if (!["pending", "needs_resubmission", "rejected"].includes(driver.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update KYC information when status is '${driver.status}'`,
      });
    }

    // Validate new license expiry if provided
    if (req.body.licenseExpiryDate) {
      const licenseExpiryDate = new Date(req.body.licenseExpiryDate);
      if (licenseExpiryDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "License is expired. Please provide a valid license.",
        });
      }
    }

    // Force status to "pending" on update, clear rejection reason
    const updateData = {
      ...req.body,
      status: "pending",
      rejectionReason: undefined,
    };

    const updatedDriver = await DriverModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    // Emit an event that the driver's KYC info was updated
    if (io) {
      io.emit("driver_kyc_updated", {
        driverId: updatedDriver._id,
        userId: updatedDriver.user,
        message: "Driver KYC information updated and set back to pending",
      });
    }

    return res.status(200).json({
      success: true,
      message: "KYC information updated successfully",
      data: updatedDriver,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists. Please provide a unique value.`,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update KYC information",
      error: error.message,
    });
  }
};

/**
 * UPDATE KYC STATUS (admin side: verified, rejected, etc.)
 */
export const updateDriverStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status, rejectionReason } = req.body;
    const adminId = req.adminId || null; // from auth middleware, if any

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    if (!["pending", "verified", "rejected", "needs_resubmission"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    if (["rejected", "needs_resubmission"].includes(status) && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required for this status",
      });
    }

    const updateData = {
      status,
      reviewedBy: adminId,
      rejectionReason: ["rejected", "needs_resubmission"].includes(status)
        ? rejectionReason
        : undefined,
      verifiedAt: status === "verified" ? new Date() : undefined,
    };

    const updatedDriver = await DriverModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true, session }
    );

    if (!updatedDriver) {
      return res.status(404).json({
        success: false,
        message: "KYC submission not found",
      });
    }

    await session.commitTransaction();
    session.endSession();

    // Emit an event that the driver's KYC status changed
    if (io) {
      io.emit("driver_kyc_status_changed", {
        driverId: updatedDriver._id,
        userId: updatedDriver.user,
        newStatus: status,
        message: `Driver KYC status updated to ${status}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "KYC status updated successfully",
      data: updatedDriver,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      success: false,
      message: "Failed to update KYC status",
      error: error.message,
    });
  }
};

/**
 * DELETE KYC RECORD
 */
export const deleteDriver = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const driver = await DriverModel.findById(req.params.id).session(session);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "KYC submission not found",
      });
    }

    // Clean up image files if using cloudinary
    const imageFields = [
      "photo",
      "frontPhoto",
      "backPhoto",
      "vehiclePhoto",
      "vehicleDetailPhoto",
      "ownerDetailPhoto",
      "renewalDetailPhoto",
      "insurancePhoto",
    ];

    for (const field of imageFields) {
      if (driver[field]) {
        try {
          await deleteCloudinaryAssets(driver[field]);
        } catch (err) {
          console.error(`Failed to delete image: ${driver[field]}`, err);
        }
      }
    }

    await DriverModel.findByIdAndDelete(req.params.id).session(session);

    await session.commitTransaction();
    session.endSession();

    // Emit an event that the driver KYC record was deleted
    if (io) {
      io.emit("driver_kyc_deleted", {
        driverId: req.params.id,
        userId: driver.user,
        message: "Driver KYC record deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "KYC record deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      success: false,
      message: "Failed to delete KYC record",
      error: error.message,
    });
  }
};
