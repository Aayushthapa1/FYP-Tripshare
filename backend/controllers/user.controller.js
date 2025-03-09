import bcrypt from "bcryptjs";
import cookie from "cookie";
import User from "../models/user.model.js";
import {
  registerUserSchema,
  loginUserSchema,
} from "../middlewares/validationSchema.js";
import nodemailer from "nodemailer";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateAuthToken.js";
import { createResponse } from "../utils/responseHelper.js";

// Utility function to generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
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
  console.log("entered teh user profile")
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
    const { fullName ,address, userName, phoneNumber } = req.body;
    console.log("The req body is", req.body);

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



// Add this new function to get users by role
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

// Send Email OTP
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if email is provided
    if (!email || typeof email !== "string") {
      return res.status(400).json(
        createResponse(400, false, [{ message: "Email is required and must be a string" }])
      );
    }

    // Normalize email: trim whitespace and convert to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    console.log("Searching for user with email:", normalizedEmail); // Debugging log

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log("User not found in database"); // Debugging log
      return res.status(404).json(
        createResponse(404, false, [{ message: "No user found with this email" }])
      );
    }

    const resetOTP = generateOTP();
    user.resetPasswordOTP = resetOTP;
    user.resetPasswordOTPExpires = Date.now() + 600000; // 10 minutes
    await user.save();

    console.log("Sending OTP to email:", normalizedEmail); // Debugging log

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: normalizedEmail,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${resetOTP}. Valid for 10 minutes.`,
    });

    return res.status(200).json(
      createResponse(200, true, [], {
        message: "Password reset OTP sent to email"
      })
    );
  } catch (error) {
    console.error("Error in forgotPassword:", error); // Debugging log
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { otp, newPassword, confirmPassword } = req.body;

    if (!otp || !newPassword || !confirmPassword) {
      return res.status(400).json(
        createResponse(400, false, [{ message: "All fields are required" }])
      );
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json(
        createResponse(400, false, [{ message: "Passwords do not match" }])
      );
    }

    const user = await User.findOne({
      resetPasswordOTP: otp,
      resetPasswordOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json(
        createResponse(400, false, [{ message: "Invalid or expired OTP" }])
      );
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();

    return res.status(200).json(
      createResponse(200, true, [], {
        message: "Password reset successful"
      })
    );
  } catch (error) {
    next(error);
  }
};