import bcrypt from "bcryptjs";
import cookie from "cookie";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import {
  registerUserSchema,
  loginUserSchema,
  resetPasswordSchema // Make sure this is imported
} from "../middlewares/validationSchema.js";
import { sendEmail } from "../utils/sendEmail.js";
import rateLimit from "express-rate-limit";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateAuthToken.js";
import { createResponse } from "../utils/responseHelper.js";

// Rate limiter for password reset requests
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many password reset attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export const userRegister = async (req, res, next) => {
  try {
    await registerUserSchema.validateAsync(req.body);
    const { fullName, userName, address, email, password, phoneNumber, role = "user" } = req.body;

    // Check for existing email or phone number
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(409)
          .json(createResponse(409, false, [{ message: "Email already exists" }]));
      }
      if (existingUser.phoneNumber === phoneNumber) {
        return res
          .status(409)
          .json(createResponse(409, false, [{ message: "Phone number already exists" }]));
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      userName,
      address,
      email,
      phoneNumber,
      password: hashedPassword,
      role
    });

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to TripShare",
        template: "registration",
        context: { name: fullName }
      });
      console.log(`Registration email sent to ${email}`);
    } catch (emailError) {
      console.error("Failed to send registration email:", emailError);
    }

    const userObj = newUser.toObject();
    delete userObj.password;

    return res.status(200).json(
      createResponse(200, true, [], {
        message: "User registered successfully",
        user_data: userObj,
      })
    );
  } catch (error) {
    if (error.isJoi) {
      return res
        .status(400)
        .json(
          createResponse(400, false, [{ message: error.details[0].message }])
        );
    }
    next(error);
  }
};

export const userLogin = async (req, res, next) => {
  try {
    console.log("The req body is", req.body);
    await loginUserSchema.validateAsync(req.body);
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "User not found" }]));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json(createResponse(401, false, [{ message: "Invalid credentials" }]));
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;
    console.log("the user ibject is", userObj)

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });



    return res.status(200).json(
      createResponse(200, true, [], {
        message: "Login successful",
        user_data: userObj,
      })
    );
  } catch (error) {
    if (error.isJoi) {
      return res
        .status(400)
        .json(
          createResponse(400, false, [{ message: error.details[0].message }])
        );
    }
    next(error);
  }
};

export const userLogout = async (req, res, next) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res
      .status(200)
      .json(
        createResponse(200, true, [], { message: "Logged out successfully" })
      );
  } catch (error) {
    console.error("Error during logout:", error);
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json(createResponse(404, false, [{ message: "User not found" }], null));
    }

    const userObject = user.toObject();

    return res.status(200).json(
      createResponse(200, true, [], {
        message: "User data fetched successfully",
        user_data: userObject,
      })
    );
  } catch (error) {
    console.error("Error while fetching user profile:", error);
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, address, userName, phoneNumber } = req.body;
    // Fetch the user based on the decoded ID from the protected route
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json(
        createResponse(404, false, [{ message: "User not found" }])
      );
    }

    // Phone number check
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const phoneExists = await User.findOne({
        phoneNumber,
        _id: { $ne: user._id },  // Exclude current user from check
      });

      if (phoneExists) {
        return res.status(409).json(
          createResponse(409, false, [{ message: "Phone number already exists" }])
        );
      }
      user.phoneNumber = phoneNumber;
    }

    // Update other fields if provided
    if (fullName) user.fullName = fullName;
    if (address) user.address = address;
    if (userName) user.userName = userName;

    // Save the updated user object
    await user.save();

    // Remove sensitive information (password) from the user object before sending it back
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json(
      createResponse(200, true, [], {
        message: "User profile updated successfully",
        user_data: userObj,
      })
    );
  } catch (error) {
    next(error);  // Forward error to centralized error handler
  }
};

export const getUsersByRole = async (req, res, next) => {
  try {
    const { role } = req.params;

    if (!["user", "driver", "admin"].includes(role)) {
      return res
        .status(400)
        .json(createResponse(400, false, [{ message: "Invalid role specified" }], null));
    }

    const users = await User.find({ role }).select("-password");

    return res.status(200).json(
      createResponse(200, true, [], {
        message: `${role}s fetched successfully`,
        users_data: users,
      })
    );
  } catch (error) {
    console.error(`Error while fetching ${role}s:`, error);
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    // Get query parameters for filtering
    const { role, sortBy, limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (role && ["user", "driver", "Admin"].includes(role)) {
      filter.role = role;
    }

    // Count documents by role for dashboard stats
    const userCount = await User.countDocuments({ role: "user" });
    const driverCount = await User.countDocuments({ role: "driver" });
    const adminCount = await User.countDocuments({ role: "Admin" });
    const totalUsers = userCount + driverCount + adminCount;

    // Fetch paginated users with filters
    const users = await User.find(filter)
      .select("-password -resetPasswordOTP -resetPasswordOTPExpires")
      .sort(sortBy ? { [sortBy]: 1 } : { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const totalCount = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    console.log(`Found ${users.length} users matching criteria (page ${page}/${totalPages})`);

    return res.status(200).json({
      status: 200,
      success: true,
      errors: [],
      result: {
        message: "Users fetched successfully",
        stats: {
          totalUsers,
          userCount,
          driverCount,
          adminCount
        },
        pagination: {
          totalCount,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        },
        users_data: users,
      }
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      errors: [{ message: error.message }],
      result: {
        message: "Failed to fetch users",
      }
    });
  }
};

// Enhanced forgot password function
export const forgotPassword = async (req, res, next) => {
  try {
    console.log("Received request body for forgot password:", req.body);

    const { email } = req.body;

    // Check if email is provided
    if (!email || typeof email !== "string") {
      return res.status(400).json(
        createResponse(400, false, [{ message: "Email is required and must be a string" }])
      );
    }

    // Normalize email: trim whitespace and convert to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    console.log("Searching for user with email:", normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log("User not found in database");
      return res.status(404).json(
        createResponse(404, false, [{ message: "No user found with this email" }])
      );
    }

    // Create a JWT token for password reset
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_RESET_SECRET || "reset-token-secret",
      { expiresIn: "10m" } // 10 minutes expiration
    );

    // Store hashed token in database
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(resetToken, salt);

    user.resetPasswordOTP = hashedToken;
    user.resetPasswordOTPExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    // Create a reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/resetpassword/${resetToken}`;

    console.log("Sending reset link to email:", normalizedEmail);
    console.log("Reset URL:", resetUrl);

    await sendEmail({
      to: normalizedEmail,
      subject: "Password Reset",
      template: "resetPassword",
      context: {
        name: user.fullName,
        resetUrl: resetUrl,
        expiresIn: "10 minutes"
      }
    });

    return res.status(200).json(
      createResponse(200, true, [], {
        message: "Password reset link sent to email"
      })
    );
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    next(error);
  }
};

// Enhanced reset password function
export const resetPassword = async (req, res, next) => {
  try {
    console.log("Received reset password request:", req.body);

    const { token, newPassword, confirmPassword } = req.body;

    // Validate basic required fields before schema validation
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json(
        createResponse(400, false, [{ message: "All fields are required" }])
      );
    }

    // Validate with Joi schema
    try {
      await resetPasswordSchema.validateAsync(req.body);
    } catch (validationError) {
      return res.status(400).json(
        createResponse(400, false, [{ message: validationError.details[0].message }])
      );
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json(
        createResponse(400, false, [{ message: "Passwords do not match" }])
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_RESET_SECRET || "reset-token-secret");
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(400).json(
        createResponse(400, false, [{ message: "Invalid or expired reset token" }])
      );
    }

    console.log("Token decoded successfully:", decoded);

    // Find user by ID from token
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log("User not found or token expired");
      return res.status(400).json(
        createResponse(400, false, [{ message: "Invalid or expired reset token" }])
      );
    }

    console.log("User found for password reset:", user._id);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset fields
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    console.log("Password updated successfully for user:", user._id);

    // Send confirmation email
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Successful",
        template: "passwordResetSuccess",
        context: {
          name: user.fullName,
          loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
        }
      });
      console.log("Password reset confirmation email sent");
    } catch (emailError) {
      console.error("Failed to send password reset confirmation email:", emailError);
      // Continue with the response even if the email fails
    }

    return res.status(200).json(
      createResponse(200, true, [], {
        message: "Password reset successful"
      })
    );
  } catch (error) {
    console.error("Unhandled error in resetPassword:", error);
    next(error);
  }
};