import { Request, Response } from "express";
import { UserService } from "./user.service.js";
import { AppError } from "../common/errors/app.error.js";
import { changePasswordSchema } from "./user.validator.js";
import logger from "../common/utilities/logger/index.js";

export class UserController {
  private readonly userService = new UserService();

  changePassword = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized!", 401);
    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success)
      throw new AppError(result.error.errors[0].message, 400);
    const { oldPassword, newPassword } = result.data;
    const data = await this.userService.changePassword(
      userId,
      oldPassword,
      newPassword
    );
    res.json(data);
  };

  updateUserImage = async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("No image file provided", 400);
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const data = await this.userService.updateUserImage(
      userId,
      req.file.buffer
    );
    res.json(data);
  };

  getUserProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const result = await this.userService.getUserProfile(userId);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      logger.error("Error in getUserProfile controller:", error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  };

  updateUserProfile = async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const { fullName, phone } = req.body;

      const result = await this.userService.updateUserProfile(
        userId,
        fullName,
        phone
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      logger.error("Error in updateUserProfile controller:", error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  };
}
