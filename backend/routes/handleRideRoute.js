import express from "express";
import {
  postRide,
  requestRide,
  updateRideStatus,
  getRideHistory,
  getActiveRide,
  updatePaymentStatus,
  searchDrivers,
 
  getPendingRides
} from "../controllers/handleRideController.js";

const router = express.Router();


router.post("/postride", postRide);
router.post("/requestride", requestRide);
router.put("/updateridestatus", updateRideStatus);
router.get("/ridehistory", getRideHistory);
router.get("/activeride", getActiveRide);
router.put("/paymentstatus", updatePaymentStatus);
router.get("/searchdrivers", searchDrivers);
router.get("/pending", getPendingRides);

export default router;