import multer from "multer";
import path from "path";
import fs from "fs";

// Create an uploads directory if it doesn’t exist
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer’s storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // all files go into `uploads/`
  },
  filename: function (req, file, cb) {
    // e.g. "photo-1681234567890.png"
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// 5MB limit, only allow .jpg/.jpeg/.png
export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
      return cb(new Error("Only image files (jpg, jpeg, png) are allowed!"), false);
    }
    cb(null, true);
  },
});

// Handy named exports for single or multiple field usage
export const singleUpload = (fieldName) => upload.single(fieldName);
export const multipleUpload = (fields) => upload.fields(fields);
