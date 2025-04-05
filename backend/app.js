import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import _config from "./utils/config.js";
import globalErrorHandler, {
  notFoundHandler,
} from "./middlewares/globalErrorHandler.js";
import authRoute from "./routes/authRoute.js";

import tripRoute from "./routes/tripRoute.js";
import driverKYCRoute from "./routes/driverKYCRoute.js";
import handleRideRoute from "./routes/handleRideRoute.js";
import userRoute from "./routes/userRoute.js";
import bookingRoutes from "./routes/bookingRoute.js";
import paymentRoutes from "./routes/paymentRoute.js";
import chatRoutes from "./routes/chatRoute.js";
import UserKYCRoute from "./routes/UserKYCRoute.js"
import fileUpload from "express-fileupload"
import notificationRoute from "./routes/notificationRoute.js"

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
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/"
}))

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/trips", tripRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/drivers", driverKYCRoute);
app.use("/api/rides", handleRideRoute);
app.use("/api/user", userRoute);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/userkyc", UserKYCRoute);
app.use("/api/notifications", notificationRoute);
// Root route
app.get("/", (req, res) => {
  res.send("Ride Share platform running...");
});

// Error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;