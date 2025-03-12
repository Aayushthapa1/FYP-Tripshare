import jwt from "jsonwebtoken";
import _config from "../utils/config.js";
import User from "../models/userModel.js";
import { createResponse } from "../utils/responseHelper.js";

const protectRoute = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json(createResponse(401, false, ["No token provided, unauthorized"]));
    }

    const jwtSecret = _config.jwtKey;
    const decoded = jwt.verify(token, jwtSecret);

    // e.g., token was signed with { sub: user._id }
    const user = await User.findById(decoded.sub).select("-password");
    if (!user) {
      return res
        .status(404)
        .json(createResponse(404, false, ["User not found"]));
    }

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
