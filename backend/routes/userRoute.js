import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {
  getUserProfile,
  updateUserProfile,
  getUsersByRole,
  forgotPassword,
  resetPassword,
  getAllUsers
} from "../controllers/userController.js";

const router = express.Router();

router.get("/:id", protectRoute, getUserProfile);
router.put("/:id", protectRoute, updateUserProfile);
router.get("/getUsersByRole/:role", protectRoute, getUsersByRole);
router.get("/all",  getAllUsers);




export default router;