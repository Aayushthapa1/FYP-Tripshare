import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { uploadToCloudinary } from '../config/cloudinaryConfig.js';
import sharp from 'sharp';
import fs from 'fs';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads/temp');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize upload middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Process and upload image to Cloudinary
export const processAndUploadImage = async (filePath, options = {}) => {
  let thumbnailPath = null;
  
  try {
    // Create thumbnail for images
    thumbnailPath = path.join(path.dirname(filePath), `thumb_${path.basename(filePath)}`);
    
    // Get original image dimensions
    const metadata = await sharp(filePath).metadata();
    
    // Create thumbnail (500px width, maintaining aspect ratio)
    await sharp(filePath)
      .resize(500)
      .toFile(thumbnailPath);

    // Upload original image
    const imageUrl = await uploadToCloudinary(filePath, {
      folder: 'tripshare/chat',
      ...options
    });

    // Upload thumbnail
    const thumbnailUrl = await uploadToCloudinary(thumbnailPath, {
      folder: 'tripshare/chat/thumbnails',
      ...options
    });

    // Calculate file size
    const stats = await fs.promises.stat(filePath);
    const mediaSize = stats.size;

    // Clean up local files
    await Promise.all([
      fs.promises.unlink(filePath).catch(() => {}),
      fs.promises.unlink(thumbnailPath).catch(() => {})
    ]);

    return {
      mediaUrl: imageUrl,
      mediaThumbnail: thumbnailUrl,
      mediaDimensions: {
        width: metadata.width,
        height: metadata.height
      },
      fileType: metadata.format,
      mediaSize
    };
  } catch (error) {
    // Clean up if error occurs
    try {
      if (filePath && fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath).catch(() => {});
      }
      if (thumbnailPath && fs.existsSync(thumbnailPath)) {
        await fs.promises.unlink(thumbnailPath).catch(() => {});
      }
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
    
    throw error;
  }
};

// Process and upload file (non-image) to Cloudinary
export const processAndUploadFile = async (filePath, options = {}) => {
  try {
    // Get file stats
    const stats = await fs.promises.stat(filePath);
    const mediaSize = stats.size;
    
    // Get file extension
    const fileExt = path.extname(filePath).toLowerCase().substring(1);
    
    // Upload file
    const fileUrl = await uploadToCloudinary(filePath, {
      folder: 'tripshare/chat/files',
      resource_type: 'auto',
      ...options
    });

    // Clean up local file
    await fs.promises.unlink(filePath).catch(() => {});

    return {
      mediaUrl: fileUrl,
      fileType: fileExt,
      mediaSize
    };
  } catch (error) {
    // Clean up if error occurs
    if (filePath && fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath).catch(() => {});
    }
    throw error;
  }
};