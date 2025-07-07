import { Router } from "express";
import { UploadController } from "./upload.controller.js";
import {
  uploadSingleImage,
  uploadMultipleImages,
  validateImageUpload,
  validateMultipleImagesUpload,
} from "../common/middleware/upload.middleware.js";

const router = Router();
const controller = new UploadController();

// Upload single image
router.post(
  "/single",
  uploadSingleImage,
  validateImageUpload,
  controller.uploadSingleImage
);

// Upload multiple images
router.post(
  "/multiple",
  uploadMultipleImages,
  validateMultipleImagesUpload,
  controller.uploadMultipleImages
);

// Delete image
router.delete("/:publicId", controller.deleteImage);

// Update image (delete old, upload new)
router.put(
  "/:oldPublicId",
  uploadSingleImage,
  validateImageUpload,
  controller.updateImage
);

// Get optimized image URL
router.get("/optimize/:publicId", controller.getOptimizedUrl);

export default router;
