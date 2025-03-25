import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath) => {
  try {
    // Check if file exists before uploading
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    console.log(`Attempting to upload file from: ${filePath}`);

    // Upload the image
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "KYC",
      resource_type: "auto" // Automatically detect file type
    });

    console.log(`Successfully uploaded to Cloudinary: ${result.secure_url}`);

    // Remove the file from temp folder
    fs.unlinkSync(filePath);

    return result.secure_url;
  } catch (error) {
    // Remove the file from temp folder if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.error("Error uploading to Cloudinary:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

export default cloudinary;