import UserModel from "../models/UserModel.js"
import UserKYCModel from "../models/UserKYCModel.js"
import { uploadToCloudinary } from "../config/cloudinaryConfig.js"

// Submit User KYC (only personal information)

export const submitUserKYC = async (req, res) => {
    try {
        console.log("submitUserKYC request body:", req.body)
        console.log("submitUserKYC request files:", req.files)
        console.log("submitUserKYC request params:", req.params)
        console.log("submitUserKYC request query:", req.query)

        // Get userId from request - explicitly check form-data field 
        let userId = req.params.userId

        // If not in params, check form fields (considering your form data shows userId field)
        if (!userId && req.body) {
            userId = req.body.userId || req.body.userID || req.body.userid || req.body.user_id
        }

        // Check query params as last resort
        if (!userId && req.query) {
            userId = req.query.userId || req.query.userID || req.query.user_id
        }

        console.log("Extracted userId:", userId)

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            })
        }

        // Rest of your code remains the same...
        // Find the user by ID
        const user = await UserModel.findById(userId)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        // Verify that the email in the request matches the user's email
        if (req.body.email && req.body.email !== user.email) {
            return res.status(403).json({
                success: false,
                message: "The email provided does not match your account email",
            })
        }

        // Handle citizenship front photo upload
        let citizenshipFrontUrl = ""
        if (req.files && req.files.citizenshipFront) {
            citizenshipFrontUrl = await uploadToCloudinary(req.files.citizenshipFront.tempFilePath)
        } else {
            return res.status(400).json({
                success: false,
                message: "Citizenship front photo is required",
            })
        }

        // Handle citizenship back photo upload
        let citizenshipBackUrl = ""
        if (req.files && req.files.citizenshipBack) {
            citizenshipBackUrl = await uploadToCloudinary(req.files.citizenshipBack.tempFilePath)
        } else {
            return res.status(400).json({
                success: false,
                message: "Citizenship back photo is required",
            })
        }

        // Check if KYC already exists for this user
        let userKYC = await UserKYCModel.findOne({ userId })

        if (userKYC) {
            // Update existing KYC
            userKYC.gender = req.body.gender || userKYC.gender
            userKYC.citizenshipNumber = req.body.citizenshipNumber || userKYC.citizenshipNumber
            userKYC.citizenshipFront = citizenshipFrontUrl || userKYC.citizenshipFront
            userKYC.citizenshipBack = citizenshipBackUrl || userKYC.citizenshipBack
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

        // Update user's fullName and address if provided
        if (req.body.fullName) {
            user.fullName = req.body.fullName
        }

        if (req.body.address) {
            user.address = req.body.address
        }

        // Save dob if provided
        if (req.body.dob) {
            user.dob = req.body.dob
        }

        await user.save()

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
// Get User KYC Status
export const getUserKYCStatus = async (req, res) => {
    try {
        const { userId } = req.params

        // Find the user
        const user = await UserModel.findById(userId)

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

// Update User KYC Status (for admin)
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
        const user = await UserModel.findById(userId)

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

        // Add rejection reason if status is rejected
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

