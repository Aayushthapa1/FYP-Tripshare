import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs/promises"; // Using promise-based fs

dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    // Check if file exists before uploading
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    console.log(`Attempting to upload file from: ${filePath}`);

    // Default options
    const defaultOptions = {
      folder: "tripshare", // Default folder
      resource_type: "auto", // Automatically detect file type
    };

    // Merge default options with provided options
    const uploadOptions = { ...defaultOptions, ...options };

    // Upload the file
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    console.log(`Successfully uploaded to Cloudinary: ${result.secure_url}`);

    // Return the full result object
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};


export const uploadToCloudinaryEnhanced = async (
  filePath,
  options = {},
  deleteAfterUpload = true
) => {
  try {
    // Check if file exists before uploading
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    // Default options
    const defaultOptions = {
      folder: "tripshare",
      resource_type: "auto",
    };

    // Merge default options with provided options
    const uploadOptions = { ...defaultOptions, ...options };

    // Upload the file
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    // Delete the file if requested
    if (deleteAfterUpload) {
      await fs.unlink(filePath).catch(err => {
        console.warn(`Warning: Could not delete file ${filePath}:`, err);
      });
    }

    return {
      mediaUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      createdAt: result.created_at,
      tags: result.tags,
      originalFilename: result.original_filename,
    };
  } catch (error) {
    // Try to clean up the file if it exists
    if (deleteAfterUpload) {
      try {
        await fs.access(filePath);
        await fs.unlink(filePath).catch(() => { });
      } catch (accessError) {
        // File doesn't exist, no need to delete
      }
    }

    console.error("Error uploading to Cloudinary:", error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

export default cloudinary;