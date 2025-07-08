import bcrypt from "bcrypt";
import prisma from "../../db/prisma.js";
import { AppError } from "../common/errors/app.error.js";
import { CloudinaryService } from "../common/cloudinary/index.js";
import logger from "../common/utilities/logger/index.js";

export class UserService {
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) throw new AppError("Old password is incorrect", 400);

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { message: "Password changed successfully" };
  }

  async updateUserImage(userId: string, imageBuffer: Buffer) {
    try {
      // Get the current user to check if they have an existing image
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { imageUrl: true },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      let oldPublicId: string | undefined;
      if (user.imageUrl) {
        const urlParts = user.imageUrl.split("/");
        const filename = urlParts[urlParts.length - 1];
        oldPublicId = filename.split(".")[0];
      }

      // Upload new image to Cloudinary
      const uploadResult = await CloudinaryService.uploadImage(
        imageBuffer,
        "users",
        {
          width: 400,
          height: 400,
          crop: "fill",
          gravity: "face",
          quality: "auto",
        }
      );

      // Update user with new image URL
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { imageUrl: uploadResult.secure_url },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          imageUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Delete old image from Cloudinary if it exists
      if (oldPublicId) {
        try {
          await CloudinaryService.deleteImage(oldPublicId);
        } catch (error) {
          logger.warn(
            `Failed to delete old image ${oldPublicId}:${error.message}`
          );
        }
      }

      return {
        message: "User image updated successfully",
        data: updatedUser,
      };
    } catch (error: any) {
      logger.error("Error updating user image:", error);
      throw new AppError(
        error.message || "Failed to update user image",
        error.statusCode || 500
      );
    }
  }

  async getUserProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          imageUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          addresses: {
            select: {
              id: true,
              address: true,
              state: true,
              country: true,
              isDefault: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      return {
        message: "User profile fetched successfully",
        data: user,
      };
    } catch (error: any) {
      logger.error("Error fetching user profile:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to fetch user profile", 500);
    }
  }

  async updateUserProfile(userId: string, fullName?: string, phone?: string) {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new AppError("User not found", 404);
      }

      // Check if phone is being updated and if it's already taken by another user
      if (phone && phone !== existingUser.phone) {
        const phoneExists = await prisma.user.findUnique({
          where: { phone },
        });

        if (phoneExists) {
          throw new AppError("Phone number is already in use", 409);
        }
      }

      // Prepare update data
      const updateData: any = {};
      if (fullName) updateData.fullName = fullName;
      if (phone) updateData.phone = phone;

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          imageUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        message: "User profile updated successfully",
        data: updatedUser,
      };
    } catch (error: any) {
      logger.error("Error updating user profile:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to update user profile", 500);
    }
  }
}
