import jwt from "jsonwebtoken";
import _config from "../utils/config.js";

import User from "../models/user.model.js";
import { createResponse } from "../utils/responseHelper.js";

const protectRoute = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
    console.log("Th token is ", token);

    if (!token) {
      return res
        .status(401)
        .json(
          createResponse(401, false, ["No token provided, unauthorized access"])
        );
    }
    const jwtSecret = _config.jwtKey;
    console.log("The jwt key isssss is", jwtSecret);
    // Verify the token
    const decoded = jwt.verify(token, jwtSecret);

    console.log("The decoded token is", decoded);

    // Find the user in the database
    const user = await User.findById(decoded.sub).select("-password");
    console.log("The user is", user);
    if (!user) {
      return res
        .status(404)
        .json(createResponse(404, false, ["User not found"]));
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("The error is", error);
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json(
          createResponse(401, false, ["Token expired, please log in again"])
        );
    } else if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json(createResponse(401, false, ["Invalid token, access denied"]));
    } else {
      console.error("Error occurred while protecting route:", error);
      return res
        .status(500)
        .json(createResponse(500, false, ["Internal Server Error"]));
    }
  }
};

export default protectRoute;
