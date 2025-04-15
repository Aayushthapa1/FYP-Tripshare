// /startup/connectToServices.js
import connectToDB from "../utils/connectToDB.js";
import cloudinary from "../config/cloudinaryConfig.js";

const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connected:", result);
  } catch (err) {
    console.error("❌ Cloudinary connection failed:", err);
    throw err;
  }
};

const connectToServices = async () => {
  await connectToDB();
  await testCloudinaryConnection();
};

export default connectToServices;
