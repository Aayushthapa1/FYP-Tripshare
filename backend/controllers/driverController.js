
import upload from '../config/multerConfig.js';
import nodemailer from 'nodemailer';
import Driver from "../models/driverModel.js"

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Save Personal Information
export const savePersonalInformation = async (req, res) => {
    upload.single('photo')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        const { fullName, address, email, gender, dob, citizenshipNumber, userId } = req.body;

        // Validate required fields
        if (!fullName || !address || !email || !gender || !dob || !citizenshipNumber || !req.file || !userId) {
            return res.status(400).json({ message: 'All fields are required, including the photo and user ID.' });
        }

        const photo = `/uploads/${req.file.filename}`; // Path to the uploaded photo

        try {
            // Check if the email or citizenship number already exists
            const existingDriver = await DriverModel.findOne({
                $or: [{ email }, { citizenshipNumber }],
            });

            if (existingDriver) {
                return res.status(400).json({ message: 'Email or Citizenship Number already exists.' });
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
                user: userId, // Link to Nepride user
                status: 'pending', // Default status
            });

            return res.status(201).json({
                message: 'Personal information saved successfully.',
                driver,
            });
        } catch (error) {
            return res.status(500).json({ message: 'Something went wrong.', error: error.message });
        }
    });
};

// Save License Information
export const saveLicenseInformation = async (req, res) => {
    upload.fields([
        { name: 'frontPhoto', maxCount: 1 },
        { name: 'backPhoto', maxCount: 1 },
    ])(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        const { licenseNumber, driverId } = req.body;
        const frontPhoto = req.files?.frontPhoto?.[0]?.path;
        const backPhoto = req.files?.backPhoto?.[0]?.path;

        // Validate required fields
        if (!licenseNumber || !frontPhoto || !backPhoto || !driverId) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        try {
            // Find the driver by ID
            const driver = await DriverModel.findById(driverId);
            if (!driver) {
                return res.status(404).json({ message: 'Driver not found.' });
            }

            // Update license information
            driver.licenseNumber = licenseNumber;
            driver.frontPhoto = `/uploads/${req.files.frontPhoto[0].filename}`;
            driver.backPhoto = `/uploads/${req.files.backPhoto[0].filename}`;
            await driver.save();

            return res.status(200).json({
                message: 'License information saved successfully.',
                driver,
            });
        } catch (error) {
            return res.status(500).json({ message: 'Something went wrong.', error: error.message });
        }
    });
};
// Save Vehicle Information
export const saveVehicleInformation = async (req, res) => {
    upload.fields([
        { name: 'vehiclePhoto', maxCount: 1 },
        { name: 'vehicleDetailPhoto', maxCount: 1 },
        { name: 'ownerDetailPhoto', maxCount: 1 },
        { name: 'renewalDetailPhoto', maxCount: 1 },
    ])(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        const { vehicleType, numberPlate, productionYear, driverId } = req.body;
        const vehiclePhoto = req.files?.vehiclePhoto?.[0]?.path;
        const vehicleDetailPhoto = req.files?.vehicleDetailPhoto?.[0]?.path;
        const ownerDetailPhoto = req.files?.ownerDetailPhoto?.[0]?.path;
        const renewalDetailPhoto = req.files?.renewalDetailPhoto?.[0]?.path;

        // Validate required fields
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
            return res.status(400).json({ message: 'All fields are required.' });
        }

        try {
            // Find the driver by ID
            const driver = await DriverModel.findById(driverId);
            if (!driver) {
                return res.status(404).json({ message: 'Driver not found.' });
            }

            // Update vehicle information
            driver.vehicleType = vehicleType;
            driver.numberPlate = numberPlate;
            driver.productionYear = productionYear;
            driver.vehiclePhoto = `/uploads/${req.files.vehiclePhoto[0].filename}`;
            driver.vehicleDetailPhoto = `/uploads/${req.files.vehicleDetailPhoto[0].filename}`;
            driver.ownerDetailPhoto = `/uploads/${req.files.ownerDetailPhoto[0].filename}`;
            driver.renewalDetailPhoto = `/uploads/${req.files.renewalDetailPhoto[0].filename}`;
            await driver.save();

            return res.status(200).json({
                message: 'Vehicle information saved successfully.',
                driver,
            });
        } catch (error) {
            return res.status(500).json({ message: 'Something went wrong.', error: error.message });
        }
    });
};
// controllers/driverController.js

export const getAllDrivers = async (req, res) => {
    try {
      const drivers = await DriverModel.find().populate("user");
      return res.status(200).json(drivers);
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong.", error: error.message });
    }
  };


// Update Verification
export const updateDriverVerification = async (req, res) => {
    const { driverId } = req.params;
    const { status, rejectionReason } = req.body;
  
    try {
      const driver = await DriverModel.findById(driverId);
      if (!driver) {
        return res.status(404).json({ message: "Driver not found." });
      }
  
      // Update status and rejection reason (if provided)
      driver.status = status;
      if (status === "rejected" || status === "needs_resubmission") {
        driver.rejectionReason = rejectionReason;
      }
      await driver.save();
  
      // Send email notification
      const mailOptions = {
        from: process.env.EMAIL,
        to: driver.email,
        subject: "KYC Verification Status",
        text: `Dear ${driver.fullName},\n\nYour KYC application has been ${status}.\n\n${
          rejectionReason ? `Reason: ${rejectionReason}\n\n` : ""
        }Thank you for your application.\n\nBest regards,\nThe Team`,
      };
  
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      });
  
      return res.status(200).json({
        message: `Driver KYC ${status} successfully.`,
        driver,
      });
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong.", error: error.message });
    }
  };

// Submit KYC
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
        status: "pending", // Default status
      });
  
      return res.status(201).json({
        message: "KYC submitted successfully.",
        driver,
      });
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong.", error: error.message });
    }
  };

  // Get pending KYC requests (for admin)
export const getPendingKYC = async (req, res) => {
    try {
      console.log("Fetching pending KYCs...");
      const pendingKYCs = await Driver.find({ status: "pending" }).populate("user");
      console.log("Pending KYCs:", pendingKYCs);
      return res.status(200).json(pendingKYCs);
    } catch (error) {
      console.error("Error fetching pending KYCs:", error);
      return res.status(500).json({ message: "Failed to fetch pending KYC requests.", error: error.message });
    }
  };