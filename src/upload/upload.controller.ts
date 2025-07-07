import { Request, Response } from "express";
import { CloudinaryService, UploadResult } from "../common/cloudinary/index.js";
import { AppError } from "../common/errors/app.error.js";
import logger from "../common/utilities/logger/index.js";

export class UploadController {
  /**
   * Upload single image
   */
  uploadSingleImage = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        throw new AppError("No image file provided", 400);
      }

      const folder = req.body.folder || "service-booking";
      const transformation = req.body.transformation
        ? JSON.parse(req.body.transformation)
        : undefined;

      const result: UploadResult = await CloudinaryService.uploadImage(
        req.file.buffer,
        folder,
        transformation
      );

      logger.info(`Image uploaded successfully: ${result.public_id}`);

      res.json({
        success: true,
        message: "Image uploaded successfully",
        data: {
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.url,
          width: result.width,
          height: result.height,
          format: result.format,
        },
      });
    } catch (error) {
      logger.error("Upload single image error:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to upload image", 500);
    }
  };

  /**
   * Upload multiple images
   */
  uploadMultipleImages = async (req: Request, res: Response) => {
    try {
      if (!req.files || req.files.length === 0) {
        throw new AppError("No image files provided", 400);
      }

      const folder = req.body.folder || "service-booking";
      const transformation = req.body.transformation
        ? JSON.parse(req.body.transformation)
        : undefined;

      const uploadPromises = (req.files as Express.Multer.File[]).map((file) =>
        CloudinaryService.uploadImage(file.buffer, folder, transformation)
      );

      const results: UploadResult[] = await Promise.all(uploadPromises);

      logger.info(
        `Multiple images uploaded successfully: ${results.length} images`
      );

      res.json({
        success: true,
        message: `${results.length} images uploaded successfully`,
        data: results.map((result) => ({
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.url,
          width: result.width,
          height: result.height,
          format: result.format,
        })),
      });
    } catch (error) {
      logger.error("Upload multiple images error:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to upload images", 500);
    }
  };

  /**
   * Delete image
   */
  deleteImage = async (req: Request, res: Response) => {
    try {
      const { publicId } = req.params;

      if (!publicId) {
        throw new AppError("Public ID is required", 400);
      }

      const result = await CloudinaryService.deleteImage(publicId);

      if (!result) {
        throw new AppError("Failed to delete image", 500);
      }

      logger.info(`Image deleted successfully: ${publicId}`);

      res.json({
        success: true,
        message: "Image deleted successfully",
        data: { public_id: publicId },
      });
    } catch (error) {
      logger.error("Delete image error:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to delete image", 500);
    }
  };

  /**
   * Update image (delete old, upload new)
   */
  updateImage = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        throw new AppError("No image file provided", 400);
      }

      const { oldPublicId } = req.params;
      const folder = req.body.folder || "service-booking";
      const transformation = req.body.transformation
        ? JSON.parse(req.body.transformation)
        : undefined;

      const result: UploadResult = await CloudinaryService.updateImage(
        oldPublicId,
        req.file.buffer,
        folder,
        transformation
      );

      logger.info(`Image updated successfully: ${result.public_id}`);

      res.json({
        success: true,
        message: "Image updated successfully",
        data: {
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.url,
          width: result.width,
          height: result.height,
          format: result.format,
        },
      });
    } catch (error) {
      logger.error("Update image error:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to update image", 500);
    }
  };

  /**
   * Get optimized image URL
   */
  getOptimizedUrl = async (req: Request, res: Response) => {
    try {
      const { publicId } = req.params;
      const transformation = req.query.transformation
        ? JSON.parse(req.query.transformation as string)
        : undefined;

      if (!publicId) {
        throw new AppError("Public ID is required", 400);
      }

      const optimizedUrl = CloudinaryService.getOptimizedUrl(
        publicId,
        transformation
      );

      res.json({
        success: true,
        message: "Optimized URL generated successfully",
        data: {
          public_id: publicId,
          optimized_url: optimizedUrl,
        },
      });
    } catch (error) {
      logger.error("Get optimized URL error:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to generate optimized URL", 500);
    }
  };
}
