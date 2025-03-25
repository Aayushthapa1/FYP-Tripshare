import express from "express"
import { submitUserKYC, getUserKYCStatus, updateUserKYCStatus } from "../controllers/UserKYCController.js"
// Import other user controllers as needed

const router = express.Router()

// User KYC routes
router.post("/kyc", submitUserKYC) // Keep the original route
router.post("/kyc/:userId", submitUserKYC) // Add a new route that accepts userId as a parameter
router.get("/kyc/status/:userId", getUserKYCStatus)
router.put("/kyc/verify/:userId", updateUserKYCStatus)

// Add other user routes as needed
export default router