import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: "./.env" });

// Build and freeze your config object
const _config = Object.freeze({
  port: process.env.PORT || 3000,
  databaseUrl: process.env.MONGO_URI,
  jwtKey: process.env.JWT_SECRET_KEY,
  jwtExpiration: process.env.JWT_EXPIRATION,
  refreshToken: process.env.REFRESH_TOKEN_SECRET,
  cloudinaryCloud: process.env.CLOUDINARY_CLOUD,
  cloudinaryAPIKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryAPISecret: process.env.CLOUDINARY_API_SECRET,
  nodeEnv: process.env.NODE_ENV
});
console.log("console in the config file",process.env.JWT_SECRET_KEY)
console.log("the port is ", process.env.PORT)
// export default _config;
export default _config ;
