import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {
  getUserProfile,
  updateUserProfile,
  getUsersByRole,
  forgotPassword,
  resetPassword
} from "../controllers/userController.js";

const router = express.Router();

router.get("/:id", protectRoute, getUserProfile);
router.put("/:id", protectRoute, updateUserProfile);
router.get("/getUsersByRole/:role", protectRoute, getUsersByRole);


export default router;