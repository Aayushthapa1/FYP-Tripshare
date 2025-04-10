import mongoose from "mongoose";
import _config from "./config.js";

const connectToDB = async () => {
  try {
    // Debugging: Log the URI you're about to connect with
    console.log("Attempting to connect with URI:", _config.databaseUrl);

    // (Optional) Listen for connection events
    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB...");
    });
    mongoose.connection.on("error", (err) => {
      console.log("Error while connecting to MongoDB:", err);
    });

    // Connect without deprecated options
    await mongoose.connect(_config.databaseUrl);
  } catch (error) {
    console.error("Failed to connect to MongoDB...", error);
    process.exit(1);
  }
};

export default connectToDB;
