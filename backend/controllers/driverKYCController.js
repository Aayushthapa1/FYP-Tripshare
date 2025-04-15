import mongoose from "mongoose";
import DriverModel from "../models/driverKYCModel.js";
import { uploadToCloudinary } from "../config/cloudinaryConfig.js";

/**
 * Create a new driver KYC submission
 * @route POST /api/drivers/create
 * @access Private (Driver)
 *
 * NOTE: A driver can only create one record. 
 * If they need to re-submit after "rejected" or "needs_resubmission",
 * they must use the update route.
 */
export const createDriver = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check for required fields
    const requiredFields = [
      "fullName",
      "address",
      "email",
      "gender",
      "dob",
      "citizenshipNumber",
      "licenseNumber",
      "licenseExpiryDate",
      "user", // the user ID
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check if user already has a KYC submission
    const existingDriver = await DriverModel.findOne({
      user: req.body.user,
    }).session(session);

    if (existingDriver) {
      // If the driver record is found, we don't create a second record.
      return res.status(400).json({
        success: false,
        message:
          "User already has a KYC submission. If it was rejected or needs resubmission, please use the update route instead.",
      });
    }

    // Construct driverData from req.body
    const driverData = { ...req.body };

    // If there are uploaded files, push them to Cloudinary
    if (req.files) {
      // personal photo
      if (req.files.photo) {
        const photoUrl = await uploadToCloudinary(req.files.photo[0].path);
        driverData.photo = photoUrl;
      }
      // license front
      if (req.files.frontPhoto) {
        const frontPhotoUrl = await uploadToCloudinary(
          req.files.frontPhoto[0].path
        );
        driverData.frontPhoto = frontPhotoUrl;
      }
      // license back
      if (req.files.backPhoto) {
        const backPhotoUrl = await uploadToCloudinary(
          req.files.backPhoto[0].path
        );
        driverData.backPhoto = backPhotoUrl;
      }
      // optional vehicle photo
      if (req.files.vehiclePhoto) {
        const vehiclePhotoUrl = await uploadToCloudinary(
          req.files.vehiclePhoto[0].path
        );
        driverData.vehiclePhoto = vehiclePhotoUrl;
      }
    }

    // Ensure we have photo, frontPhoto, backPhoto
    if (!driverData.photo || !driverData.frontPhoto || !driverData.backPhoto) {
      return res.status(400).json({
        success: false,
        message:
          "Required photos are missing (photo, frontPhoto, backPhoto). All are required.",
      });
    }

    // Create new driver doc
    const newDriver = new DriverModel({
      ...driverData,
      status: "pending",
    });

    const savedDriver = await newDriver.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "KYC submission created successfully",
      data: savedDriver,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error.code === 11000) {
      // Duplicate key error (e.g. same licenseNumber, etc.)
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists. Please provide a unique value.`,
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
 * Get all driver KYC submissions with filtering and pagination
 * @route GET /api/drivers/all
 * @access Private (Admin)
 */
export const getDrivers = async (req, res) => {
  try {
    const { status, sort, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;

    // count total docs
    const total = await DriverModel.countDocuments(filter);

    // build sort
    let sortOption = { createdAt: -1 };
    if (sort) {
      const [field, order] = sort.split(":");
      sortOption = { [field]: order === "desc" ? -1 : 1 };
    }

    // fetch
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
 * Get a single driver KYC submission by ID
 * @route GET /api/drivers/:id
 * @access Private (Admin/Driver)
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
 * Get driver KYC submission by user ID
 * @route GET /api/drivers/user/:userId
 * @access Private (Admin/Driver)
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

    const driver = await DriverModel.findOne({ user: userId }).populate(
      "reviewedBy",
      "name email"
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
 * Update a driver KYC submission
 * @route PUT /api/drivers/update/:id
 * @access Private (Driver)
 *
 * - Only allowed if current status is "pending", "needs_resubmission", or "rejected".
 * - Any updates cause the record to return to "pending" (clearing the rejection reason).
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

    // Only allowed if status is pending, needs_resubmission, or rejected
    if (!["pending", "needs_resubmission", "rejected"].includes(driver.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update KYC when status is '${driver.status}'`,
      });
    }

    // We'll copy from req.body
    const updateData = { ...req.body };

    // Prevent direct changes to status
    if (updateData.status) {
      delete updateData.status;
    }

    // If new files, upload them
    if (req.files) {
      if (req.files.photo) {
        const photoUrl = await uploadToCloudinary(req.files.photo[0].path);
        updateData.photo = photoUrl;
      }
      if (req.files.frontPhoto) {
        const frontUrl = await uploadToCloudinary(
          req.files.frontPhoto[0].path
        );
        updateData.frontPhoto = frontUrl;
      }
      if (req.files.backPhoto) {
        const backUrl = await uploadToCloudinary(req.files.backPhoto[0].path);
        updateData.backPhoto = backUrl;
      }
      if (req.files.vehiclePhoto) {
        const vehicleUrl = await uploadToCloudinary(
          req.files.vehiclePhoto[0].path
        );
        updateData.vehiclePhoto = vehicleUrl;
      }
    }

    // Force status back to "pending" and clear rejection reason
    updateData.status = "pending";
    updateData.rejectionReason = undefined;

    const updatedDriver = await DriverModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();

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
        message: `${field} already exists. Provide a unique value.`,
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
 * Update driver KYC status (admin action)
 * @route PATCH /api/drivers/:id/status
 * @access Private (Admin)
 *
 * - Admin can set status to "pending", "verified", "rejected", or "needs_resubmission"
 * - Rejection reason is required if status is "rejected" or "needs_resubmission"
 */
export const updateDriverStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status, rejectionReason } = req.body;
    const adminId = req.adminId; // from auth middleware

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
 * Delete a driver KYC submission
 * @route DELETE /api/drivers/delete/:id
 * @access Private (Admin)
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

    // Check if driver exists
    const driver = await DriverModel.findById(req.params.id).session(session);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "KYC submission not found",
      });
    }

    await DriverModel.findByIdAndDelete(req.params.id).session(session);

    await session.commitTransaction();
    session.endSession();

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
