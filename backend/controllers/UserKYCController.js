import User from "../models/userModel.js"
import UserKYCModel from "../models/UserKYCModel.js"
import { uploadToCloudinary } from "../config/cloudinaryConfig.js"
// 1) Make sure to import `io` from server.js if you want to emit events

/**
 * SUBMIT USER KYC (Personal Info + Photos)
 */
export const submitUserKYC = async (req, res) => {
    try {
        console.log("submitUserKYC request body:", req.body)
        console.log("submitUserKYC request files:", req.files)
        console.log("submitUserKYC request params:", req.params)
        console.log("submitUserKYC request query:", req.query)

        // Convert gender to lowercase
        if (req.body.gender) {
            req.body.gender = req.body.gender.toLowerCase()
        }

        // 1) Determine userId from param/body/query
        let userId = req.params.userId
        if (!userId && req.body) {
            userId = req.body.userId || req.body.userID || req.body.userid || req.body.user_id
        }
        if (!userId && req.query) {
            userId = req.query.userId || req.query.userID || req.query.user_id
        }

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            })
        }

        // 2) Find the user
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        // 3) Verify email matches the user's email, if provided
        if (req.body.email && req.body.email !== user.email) {
            return res.status(403).json({
                success: false,
                message: "The email provided does not match your account email",
            })
        }

        // 4) Upload citizenship front photo
        let citizenshipFrontUrl = ""
        if (req.files && req.files.citizenshipFront) {
            citizenshipFrontUrl = await uploadToCloudinary(req.files.citizenshipFront.tempFilePath)
        } else {
            return res.status(400).json({
                success: false,
                message: "Citizenship front photo is required",
            })
        }

        // 5) Upload citizenship back photo
        let citizenshipBackUrl = ""
        if (req.files && req.files.citizenshipBack) {
            citizenshipBackUrl = await uploadToCloudinary(req.files.citizenshipBack.tempFilePath)
        } else {
            return res.status(400).json({
                success: false,
                message: "Citizenship back photo is required",
            })
        }

        // 6) Check if KYC already exists for this user
        let userKYC = await UserKYCModel.findOne({ userId })

        if (userKYC) {
            // Update existing KYC (re-submission case or normal updates)
            userKYC.gender = req.body.gender || userKYC.gender
            userKYC.citizenshipNumber = req.body.citizenshipNumber || userKYC.citizenshipNumber
            userKYC.citizenshipFront = citizenshipFrontUrl || userKYC.citizenshipFront
            userKYC.citizenshipBack = citizenshipBackUrl || userKYC.citizenshipBack

            // Reset status to pending, meaning user has re-submitted
            userKYC.kycStatus = "pending"
            userKYC.kycSubmittedAt = new Date()
            userKYC.kycRejectionReason = null
        } else {
            // Create new KYC
            userKYC = new UserKYCModel({
                userId,
                gender: req.body.gender,
                citizenshipNumber: req.body.citizenshipNumber,
                citizenshipFront: citizenshipFrontUrl,
                citizenshipBack: citizenshipBackUrl,
                kycStatus: "pending",
                kycSubmittedAt: new Date(),
            })
        }

        await userKYC.save()

        // 7) Update user's personal fields
        if (req.body.fullName) {
            user.fullName = req.body.fullName
        }
        if (req.body.address) {
            user.address = req.body.address
        }
        if (req.body.dob) {
            user.dob = req.body.dob
        }
        await user.save()

        // 8) Emit a real-time event that user submitted KYC (optional)
        if (typeof io !== "undefined") {
            io.emit("kyc_submitted", {
                userId: user._id,
                kycStatus: userKYC.kycStatus,
                message: "User KYC information submitted",
            })
        }

        return res.status(200).json({
            success: true,
            message: "User KYC information submitted successfully",
            user: {
                _id: user._id,
                userName: user.userName,
                email: user.email,
                fullName: user.fullName,
                kycStatus: userKYC.kycStatus,
            },
        })
    } catch (error) {
        console.error("Error submitting user KYC:", error)
        return res.status(500).json({
            success: false,
            message: "Failed to submit user KYC information",
            error: error.message,
        })
    }
}

/**
 * GET ALL PENDING USER KYC
 */
export const getPendingUserKYC = async (req, res) => {
    try {
        const pendingList = await UserKYCModel.find({ kycStatus: "pending" }).populate("userId")

        const users = pendingList.map((kyc) => ({
            _id: kyc.userId._id,
            fullName: kyc.userId.fullName,
            email: kyc.userId.email,
            kycStatus: kyc.kycStatus,
        }))

        return res.status(200).json({
            success: true,
            users,
        })
    } catch (error) {
        console.error("Error fetching pending user KYC:", error)
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pending user KYC",
            error: error.message,
        })
    }
}

/**
 * GET USER KYC STATUS
 */
export const getUserKYCStatus = async (req, res) => {
    try {
        const { userId } = req.params

        // Find the user
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        // Find the KYC information
        const userKYC = await UserKYCModel.findOne({ userId })
        if (!userKYC) {
            return res.status(200).json({
                success: true,
                kycStatus: "not_submitted",
                user: {
                    _id: user._id,
                    userName: user.userName,
                    email: user.email,
                    fullName: user.fullName,
                },
            })
        }

        return res.status(200).json({
            success: true,
            kycStatus: userKYC.kycStatus,
            kycRejectionReason: userKYC.kycRejectionReason,
            user: {
                _id: user._id,
                userName: user.userName,
                email: user.email,
                fullName: user.fullName,
            },
        })
    } catch (error) {
        console.error("Error fetching user KYC status:", error)
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user KYC status",
            error: error.message,
        })
    }
}

/**
 * UPDATE USER KYC STATUS (FOR ADMIN)
 */
export const updateUserKYCStatus = async (req, res) => {
    try {
        const { userId } = req.params
        const { status, rejectionReason } = req.body

        // Validate status
        const validStatuses = ["pending", "verified", "rejected"]
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value",
            })
        }

        // Find user by ID
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        // Find KYC information
        const userKYC = await UserKYCModel.findOne({ userId })
        if (!userKYC) {
            return res.status(404).json({
                success: false,
                message: "KYC information not found for this user",
            })
        }

        // Update status
        userKYC.kycStatus = status

        // If rejected, store rejection reason
        if (status === "rejected") {
            if (!rejectionReason) {
                return res.status(400).json({
                    success: false,
                    message: "Rejection reason is required when rejecting KYC",
                })
            }
            userKYC.kycRejectionReason = rejectionReason
        } else {
            userKYC.kycRejectionReason = null
        }

        // Add verification timestamp if verified
        if (status === "verified") {
            userKYC.kycVerifiedAt = new Date()
        }

        await userKYC.save()

        // Emit a real-time event (optional)
        if (typeof io !== "undefined") {
            io.emit("kyc_status_updated", {
                userId: user._id,
                newStatus: status,
                message: `User KYC status updated to ${status}`,
            })
        }

        return res.status(200).json({
            success: true,
            message: `User KYC status updated to ${status}`,
            user: {
                _id: user._id,
                userName: user.userName,
                email: user.email,
                fullName: user.fullName,
                kycStatus: userKYC.kycStatus,
            },
        })
    } catch (error) {
        console.error("Error updating user KYC status:", error)
        return res.status(500).json({
            success: false,
            message: "Failed to update user KYC status",
            error: error.message,
        })
    }
}

/**
 * GET ALL USERS WITH KYC (ANY STATUS)
 */
export const getAllUsersWithKYC = async (req, res) => {
    try {
        const allKycList = await UserKYCModel.find().populate("userId")

        const users = allKycList.map((kyc) => ({
            _id: kyc.userId._id,
            fullName: kyc.userId.fullName,
            email: kyc.userId.email,
            kycStatus: kyc.kycStatus,
        }))

        return res.status(200).json({
            success: true,
            users,
        })
    } catch (error) {
        console.error("Error fetching all users KYC:", error)
        return res.status(500).json({
            success: false,
            message: "Failed to fetch all users with KYC",
            error: error.message,
        })
    }
}

/**
 * GET ALL VERIFIED USER KYC
 */
export const getVerifiedUserKYC = async (req, res) => {
    try {
        const verifiedList = await UserKYCModel.find({ kycStatus: "verified" }).populate("userId")

        const users = verifiedList.map((kyc) => ({
            _id: kyc.userId._id,
            fullName: kyc.userId.fullName,
            email: kyc.userId.email,
            kycStatus: kyc.kycStatus,
        }))

        return res.status(200).json({
            success: true,
            users,
        })
    } catch (error) {
        console.error("Error fetching verified user KYC:", error)
        return res.status(500).json({
            success: false,
            message: "Failed to fetch verified user KYC",
            error: error.message,
        })
    }
}
