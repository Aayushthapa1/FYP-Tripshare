import express from "express";
import {
    submitDriverKYC,
    getDriverKYCStatus,
    updateDriverKYCStatus,
    getAllDriversWithKYC,
    getPendingDriverKYC,
    getVerifiedDriverKYC,
} from "../controllers/driverKYCController.js";

const router = express.Router();

// 1) Submit/Update KYC
router.post("/submitkycdriver/:userId", submitDriverKYC);

// 2) Single driver's KYC status
router.get("/getdriverkycstatus/:userId", getDriverKYCStatus);

// 3) Admin: get ALL KYC (any status)
router.get("/getalldriverkyc", getAllDriversWithKYC);

// 4) Admin: get only pending KYC requests
router.get("/getpendingdriverkyc", getPendingDriverKYC);

// 5) Admin: get only verified KYC
router.get("/getverifieddriverkyc", getVerifiedDriverKYC);

// 6) Admin: verify/reject driver KYC
router.put("/kycverifydriver/:userId", updateDriverKYCStatus);

export default router;