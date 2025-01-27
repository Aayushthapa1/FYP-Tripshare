// utils/connectToDB.js
import mongoose from "mongoose";
import _config from "./config.js";

const connectToDB = async () => {
  try {
    // Optional: Listen for connection events
    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB...");
    });
    mongoose.connection.on("error", (err) => {
      console.log("Error while connecting to MongoDB:", err);
    });

    // Attempt to connect using our config
    await mongoose.connect(_config.databaseUrl);

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

export default connectToDB;
