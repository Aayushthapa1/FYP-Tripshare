import User from "../models/userModel.js";
import DriverKYCModel from "../models/driverKYCModel.js";
import { uploadToCloudinary } from "../config/cloudinaryConfig.js";

/**
 * SUBMIT DRIVER KYC (Personal Info + License + Vehicle + Photos)
 */
export const submitDriverKYC = async (req, res) => {
  try {
    console.log("submitDriverKYC request body:", req.body);
    console.log("submitDriverKYC request files:", req.files);
    console.log("submitDriverKYC request params:", req.params);
    console.log("submitDriverKYC request query:", req.query);

    // Convert gender to lowercase
    if (req.body.gender) {
      req.body.gender = req.body.gender.toLowerCase();
    }

    // 1) Determine userId from param/body/query
    let userId = req.params.userId;
    if (!userId && req.body) {
      userId = req.body.userId || req.body.userID || req.body.userid || req.body.user_id;
    }
    if (!userId && req.query) {
      userId = req.query.userId || req.query.userID || req.query.user_id;
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // 2) Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3) Verify email matches the user's email, if provided
    if (req.body.email && req.body.email !== user.email) {
      return res.status(403).json({
        success: false,
        message: "The email provided does not match your account email",
      });
    }

    // 4) Verify user role is driver
    if (user.role !== "driver") {
      return res.status(403).json({
        success: false,
        message: "Only users with driver role can submit driver KYC",
      });
    }

    // 5) Upload citizenship photos
    let citizenshipFrontUrl = "";
    if (req.files && req.files.citizenshipFront) {
      citizenshipFrontUrl = await uploadToCloudinary(req.files.citizenshipFront.tempFilePath);
    } else {
      return res.status(400).json({
        success: false,
        message: "Citizenship front photo is required",
      });
    }

    let citizenshipBackUrl = "";
    if (req.files && req.files.citizenshipBack) {
      citizenshipBackUrl = await uploadToCloudinary(req.files.citizenshipBack.tempFilePath);
    } else {
      return res.status(400).json({
        success: false,
        message: "Citizenship back photo is required",
      });
    }

    // 6) Upload license photos
    let licenseFrontUrl = "";
    if (req.files && req.files.licenseFront) {
      licenseFrontUrl = await uploadToCloudinary(req.files.licenseFront.tempFilePath);
    } else {
      return res.status(400).json({
        success: false,
        message: "License front photo is required",
      });
    }

    let licenseBackUrl = "";
    if (req.files && req.files.licenseBack) {
      licenseBackUrl = await uploadToCloudinary(req.files.licenseBack.tempFilePath);
    } else {
      return res.status(400).json({
        success: false,
        message: "License back photo is required",
      });
    }

    // 7) Upload vehicle photo
    let vehiclePhotoUrl = "";
    if (req.files && req.files.vehiclePhoto) {
      vehiclePhotoUrl = await uploadToCloudinary(req.files.vehiclePhoto.tempFilePath);
    } else {
      return res.status(400).json({
        success: false,
        message: "Vehicle photo is required",
      });
    }

    // 8) Check if KYC already exists for this driver
    let driverKYC = await DriverKYCModel.findOne({ userId });

    if (driverKYC) {
      // Update existing KYC (re-submission case or normal updates)
      driverKYC.gender = req.body.gender || driverKYC.gender;
      driverKYC.citizenshipNumber = req.body.citizenshipNumber || driverKYC.citizenshipNumber;
      driverKYC.citizenshipFront = citizenshipFrontUrl || driverKYC.citizenshipFront;
      driverKYC.citizenshipBack = citizenshipBackUrl || driverKYC.citizenshipBack;

      // License information
      driverKYC.licenseNumber = req.body.licenseNumber || driverKYC.licenseNumber;
      driverKYC.licenseFront = licenseFrontUrl || driverKYC.licenseFront;
      driverKYC.licenseBack = licenseBackUrl || driverKYC.licenseBack;
      driverKYC.licenseExpiryDate = req.body.licenseExpiryDate || driverKYC.licenseExpiryDate;

      // Vehicle information
      driverKYC.vehicleType = req.body.vehicleType || driverKYC.vehicleType;
      driverKYC.vehicleModel = req.body.vehicleModel || driverKYC.vehicleModel;
      driverKYC.vehicleYear = req.body.vehicleYear || driverKYC.vehicleYear;
      driverKYC.vehiclePhoto = vehiclePhotoUrl || driverKYC.vehiclePhoto;

      // Reset status to pending, meaning driver has re-submitted
      driverKYC.kycStatus = "pending";
      driverKYC.kycSubmittedAt = new Date();
      driverKYC.kycRejectionReason = null;
    } else {
      // Create new KYC
      driverKYC = new DriverKYCModel({
        userId,
        gender: req.body.gender,
        citizenshipNumber: req.body.citizenshipNumber,
        citizenshipFront: citizenshipFrontUrl,
        citizenshipBack: citizenshipBackUrl,

        // License information
        licenseNumber: req.body.licenseNumber,
        licenseFront: licenseFrontUrl,
        licenseBack: licenseBackUrl,
        licenseExpiryDate: req.body.licenseExpiryDate,

        // Vehicle information
        vehicleType: req.body.vehicleType,
        vehicleModel: req.body.vehicleModel,
        vehicleYear: req.body.vehicleYear,
        vehiclePhoto: vehiclePhotoUrl,

        kycStatus: "pending",
        kycSubmittedAt: new Date(),
      });
    }

    await driverKYC.save();

    // 9) Update user's personal fields
    if (req.body.fullName) {
      user.fullName = req.body.fullName;
    }
    if (req.body.address) {
      user.address = req.body.address;
    }
    if (req.body.dob) {
      user.dob = req.body.dob;
    }
    await user.save();

    // 10) Emit a real-time event that driver submitted KYC (optional)
    if (typeof io !== "undefined") {
      io.emit("driver_kyc_submitted", {
        userId: user._id,
        kycStatus: driverKYC.kycStatus,
        message: "Driver KYC information submitted",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Driver KYC information submitted successfully",
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        fullName: user.fullName,
        kycStatus: driverKYC.kycStatus,
      },
    });
  } catch (error) {
    console.error("Error submitting driver KYC:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit driver KYC information",
      error: error.message,
    });
  }
};

/**
 * GET DRIVER KYC STATUS
 */
export const getDriverKYCStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify user is a driver
    if (user.role !== "driver") {
      return res.status(403).json({
        success: false,
        message: "This endpoint is only for users with driver role",
      });
    }

    // Find the KYC information
    const driverKYC = await DriverKYCModel.findOne({ userId });
    if (!driverKYC) {
      return res.status(200).json({
        success: true,
        kycStatus: "not_submitted",
        user: {
          _id: user._id,
          userName: user.userName,
          email: user.email,
          fullName: user.fullName,
        },
      });
    }

    return res.status(200).json({
      success: true,
      kycStatus: driverKYC.kycStatus,
      kycRejectionReason: driverKYC.kycRejectionReason,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error("Error fetching driver KYC status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch driver KYC status",
      error: error.message,
    });
  }
};

/**
 * UPDATE DRIVER KYC STATUS (FOR ADMIN)
 */
export const updateDriverKYCStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body;

    // Validate status
    const validStatuses = ["pending", "verified", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify user is a driver
    if (user.role !== "driver") {
      return res.status(403).json({
        success: false,
        message: "This operation is only for users with driver role",
      });
    }

    // Find KYC information
    const driverKYC = await DriverKYCModel.findOne({ userId });
    if (!driverKYC) {
      return res.status(404).json({
        success: false,
        message: "KYC information not found for this driver",
      });
    }

    // Update status
    driverKYC.kycStatus = status;

    // If rejected, store rejection reason
    if (status === "rejected") {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: "Rejection reason is required when rejecting KYC",
        });
      }
      driverKYC.kycRejectionReason = rejectionReason;
    } else {
      driverKYC.kycRejectionReason = null;
    }

    // Add verification timestamp if verified
    if (status === "verified") {
      driverKYC.kycVerifiedAt = new Date();
    }

    await driverKYC.save();

    // Emit a real-time event (optional)
    if (typeof io !== "undefined") {
      io.emit("driver_kyc_status_updated", {
        userId: user._id,
        newStatus: status,
        message: `Driver KYC status updated to ${status}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Driver KYC status updated to ${status}`,
      user: {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        fullName: user.fullName,
        kycStatus: driverKYC.kycStatus,
      },
    });
  } catch (error) {
    console.error("Error updating driver KYC status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update driver KYC status",
      error: error.message,
    });
  }
};

/**
 * GET ALL DRIVERS WITH KYC (ANY STATUS)
 */
export const getAllDriversWithKYC = async (req, res) => {
  try {
    const allKycList = await DriverKYCModel.find().populate("userId");

    const drivers = allKycList
      .filter(kyc => kyc.userId && kyc.userId.role === "driver")
      .map((kyc) => ({
        _id: kyc.userId._id,
        fullName: kyc.userId.fullName,
        email: kyc.userId.email,
        kycStatus: kyc.kycStatus,
        vehicleType: kyc.vehicleType,
        vehicleModel: kyc.vehicleModel,
      }));

    return res.status(200).json({
      success: true,
      drivers,
    });
  } catch (error) {
    console.error("Error fetching all drivers KYC:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all drivers with KYC",
      error: error.message,
    });
  }
};

/**
 * GET ALL PENDING DRIVER KYC
 */
export const getPendingDriverKYC = async (req, res) => {
  try {
    const pendingList = await DriverKYCModel.find({ kycStatus: "pending" }).populate("userId");

    const drivers = pendingList
      .filter(kyc => kyc.userId && kyc.userId.role === "driver")
      .map((kyc) => ({
        _id: kyc.userId._id,
        fullName: kyc.userId.fullName,
        email: kyc.userId.email,
        kycStatus: kyc.kycStatus,
        vehicleType: kyc.vehicleType,
        vehicleModel: kyc.vehicleModel,
      }));

    return res.status(200).json({
      success: true,
      drivers,
    });
  } catch (error) {
    console.error("Error fetching pending driver KYC:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending driver KYC",
      error: error.message,
    });
  }
};

/**
 * GET ALL VERIFIED DRIVER KYC
 */
export const getVerifiedDriverKYC = async (req, res) => {
  try {
    const verifiedList = await DriverKYCModel.find({ kycStatus: "verified" }).populate("userId");

    const drivers = verifiedList
      .filter(kyc => kyc.userId && kyc.userId.role === "driver")
      .map((kyc) => ({
        _id: kyc.userId._id,
        fullName: kyc.userId.fullName,
        email: kyc.userId.email,
        kycStatus: kyc.kycStatus,
        vehicleType: kyc.vehicleType,
        vehicleModel: kyc.vehicleModel,
      }));

    return res.status(200).json({
      success: true,
      drivers,
    });
  } catch (error) {
    console.error("Error fetching verified driver KYC:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch verified driver KYC",
      error: error.message,
    });
  }
};