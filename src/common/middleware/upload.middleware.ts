import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error.js";

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check file type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Only image files are allowed!", 400));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only allow 1 file at a time
  },
});

// Middleware for single image upload
export const uploadSingleImage = upload.single("image");

// Middleware for multiple images upload
export const uploadMultipleImages = upload.array("images", 5); // Max 5 images

// Error handling middleware for multer
export const handleUploadError = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum is 5 files.",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field.",
      });
    }
  }

  next(error);
};

// Validation middleware to check if file was uploaded
export const validateImageUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      message: "Image file is required.",
    });
    return;
  }
  next();
};

// Validation middleware for multiple images
export const validateMultipleImagesUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.files || req.files.length === 0) {
    res.status(400).json({
      success: false,
      message: "At least one image file is required.",
    });
    return;
  }
  next();
};
