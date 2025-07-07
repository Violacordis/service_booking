import { Router } from "express";
import { UserController } from "./user.controller.js";
import { authenticate } from "../common/middleware/authenticate.middleware.js";
import { validate } from "../common/middleware/validate.middleware.js";
import {
  changePasswordSchema,
  updateUserProfileSchema,
} from "./user.validator.js";
import { uploadSingleImage } from "../common/middleware/upload.middleware.js";

const router = Router();
const userController = new UserController();

// Get user profile
router.get("/profile", authenticate, userController.getUserProfile);

router.patch(
  "/profile",
  authenticate,
  validate({ body: updateUserProfileSchema }),
  userController.updateUserProfile
);

router.patch(
  "/change-password",
  authenticate,
  validate({ body: changePasswordSchema }),
  userController.changePassword
);

router.put(
  "/profile/image",
  authenticate,
  uploadSingleImage,
  userController.updateUserImage
);

export default router;
