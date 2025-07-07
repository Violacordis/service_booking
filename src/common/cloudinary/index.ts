import { v2 as cloudinary } from "cloudinary";
import config from "../config/index.js";
import logger from "../utilities/logger/index.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export class CloudinaryService {
  /**
   * Upload image to Cloudinary
   * @param file - The file buffer or base64 string
   * @param folder - The folder to upload to (optional)
   * @param transformation - Cloudinary transformation options (optional)
   * @returns Promise<UploadResult>
   */
  static async uploadImage(
    file: Buffer | string,
    folder: string = "service-booking",
    transformation?: any
  ): Promise<UploadResult> {
    try {
      const uploadOptions: any = {
        folder,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
        transformation: transformation || {
          quality: "auto",
          fetch_format: "auto",
        },
      };

      let uploadResult;
      if (Buffer.isBuffer(file)) {
        // Upload buffer using Promise-based approach
        uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) {
                logger.error("Cloudinary upload error:", error);
                reject(new Error("Failed to upload image"));
              } else {
                resolve(result);
              }
            }
          );
          uploadStream.end(file);
        });
      } else {
        // Upload base64 string
        uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
      }

      return {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        url: uploadResult.url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        resource_type: uploadResult.resource_type,
      };
    } catch (error) {
      logger.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload image to Cloudinary");
    }
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - The public ID of the image
   * @returns Promise<boolean>
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === "ok";
    } catch (error) {
      logger.error("Cloudinary delete error:", error);
      throw new Error("Failed to delete image from Cloudinary");
    }
  }

  /**
   * Update image in Cloudinary (delete old, upload new)
   * @param oldPublicId - The public ID of the old image
   * @param newFile - The new file buffer or base64 string
   * @param folder - The folder to upload to (optional)
   * @param transformation - Cloudinary transformation options (optional)
   * @returns Promise<UploadResult>
   */
  static async updateImage(
    oldPublicId: string,
    newFile: Buffer | string,
    folder: string = "service-booking",
    transformation?: any
  ): Promise<UploadResult> {
    try {
      // Delete old image if it exists
      if (oldPublicId) {
        await this.deleteImage(oldPublicId);
      }

      // Upload new image
      return await this.uploadImage(newFile, folder, transformation);
    } catch (error) {
      logger.error("Cloudinary update error:", error);
      throw new Error("Failed to update image in Cloudinary");
    }
  }

  /**
   * Generate optimized image URL with transformations
   * @param publicId - The public ID of the image
   * @param transformation - Cloudinary transformation options
   * @returns string
   */
  static getOptimizedUrl(publicId: string, transformation?: any): string {
    const defaultTransformation = {
      quality: "auto",
      fetch_format: "auto",
      width: 800,
      height: 600,
      crop: "fill",
    };

    return cloudinary.url(publicId, {
      transformation: transformation || defaultTransformation,
      secure: true,
    });
  }
}

export default CloudinaryService;
