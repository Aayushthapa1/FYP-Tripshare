import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import _config from "./utils/config.js";
import globalErrorHandler, {
  notFoundHandler,
} from "./middlewares/globalErrorHandler.js";
import authRoute from "./routes/auth.route.js";

import tripRoute from "./routes/tripRoute.js";
import driverRoute from "./routes/driverRoute.js";
import handleRideRoute from "./routes/handleRideRoute.js";
import userRoute from "./routes/user.route.js";

const app = express();


// MIDDLEWARES
app.use(
  cors({
    origin: "http://localhost:5173", // Removed the extra space
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['set-cookie']
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/trips", tripRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/drivers", driverRoute);
app.use ("/api/rides", handleRideRoute);
app.use("/api/user", userRoute);

// Root route
app.get("/", (req, res) => {
  res.send("Ride Share platform running...");
});

// Error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;