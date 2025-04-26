import express from "express";
import {
    submitUserKYC,
    getUserKYCStatus,
    updateUserKYCStatus,
    getAllUsersWithKYC,
    getPendingUserKYC, getVerifiedUserKYC,
} from "../controllers/UserKYCController.js";

const router = express.Router();

// 1) Submit/Update KYC         // no userId param
router.post("/kyc/:userId", submitUserKYC); // with userId param

// 2) Single user's KYC status
router.get("/kyc/status/:userId", getUserKYCStatus);

// 3) Admin: get ALL KYC (any status)
router.get("/all", getAllUsersWithKYC);

// 4) Admin: get only pending KYC requests
router.get("/pending", getPendingUserKYC);

router.get("/verified", getVerifiedUserKYC);

// 5) Admin: verify/reject user KYC
router.put("/kyc/verify/:userId", updateUserKYCStatus);

export default router;
