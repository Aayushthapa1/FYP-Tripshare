import multer from "multer";
import cloudinary from "./cloudinaryConfig.js";
import fs from "fs/promises"; // Use promises for cleaner async code
import createError from "http-errors";

// Multer Storage Configuration (Temporary Storage)
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Function to upload a single file to Cloudinary
export const uploadImageToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "products",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });

    // Delete file from local storage
    await fs.unlink(file.path);

    console.log("Cloudinary upload successful:", result);
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);
    throw createError(500, "Failed to upload image to Cloudinary");
  }
};

// Function to upload multiple files to Cloudinary
export const uploadMultipleToCloudinary = async (files) => {
  try {
    const uploadPromises = files.map(async (file) => {
      return await uploadImageToCloudinary(file);
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Error uploading multiple files:", error.message);
    throw createError(500, "Failed to upload images to Cloudinary");
  }
};
