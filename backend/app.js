import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import _config from "./utils/config.js";
import globalErrorHandler, {
  notFoundHandler,
} from "./middlewares/globalErrorHandler.js";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";

const app = express();

// MIDDLEWARES
app.use(
  cors({
    origin: " http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute)


app.get("/", (req, res) => {
  res.send("Ride Share platform running...");
});

app.use(notFoundHandler);

app.use(globalErrorHandler);

export default app;
