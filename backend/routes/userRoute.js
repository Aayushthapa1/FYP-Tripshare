import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import {
  getUserProfile,
  updateUserProfile,
  getUsersByRole,
  getAllUsers
} from "../controllers/userController.js";

const router = express.Router();

router.get("/getprofile/:id", protectRoute, getUserProfile);
router.put("/updateprofile/:id", protectRoute, updateUserProfile);
router.get("/getUsersByRole/:role", protectRoute, getUsersByRole);
router.get("/allusers",  getAllUsers);

export default router;