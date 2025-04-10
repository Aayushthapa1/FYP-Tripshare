import jwt from "jsonwebtoken";
import _config from "../utils/config.js";
import User from "../models/userModel.js";
import { createResponse } from "../utils/responseHelper.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Grab token from cookies or Authorization header
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    console.log("protectRoute: token =", token); // Debug log

    if (!token) {
      console.log("No token found in request");
      return res
        .status(401)
        .json(createResponse(401, false, ["No token provided, unauthorized"]));
    }

    const jwtSecret = _config.jwtKey;
    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // For example, if token is signed with { sub: user._id }
    console.log("protectRoute: decoded =", decoded);

    const user = await User.findById(decoded.sub).select("-password");
    if (!user) {
      console.log("User not found for ID:", decoded.sub);
      return res
        .status(404)
        .json(createResponse(404, false, ["User not found"]));
    }

    console.log("protectRoute: user found:", user._id);

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json(
        createResponse(401, false, [
          "Token expired, please log in again",
        ])
      );
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json(createResponse(401, false, ["Invalid token, access denied"]));
    } else {
      console.error("Error in protectRoute:", error);
      return res
        .status(500)
        .json(createResponse(500, false, ["Internal Server Error"]));
    }
  }
};

export default protectRoute;
