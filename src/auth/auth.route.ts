import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware.js";
import { AuthController } from "./auth.controller.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "./auth.validator.js";
import { authenticate } from "../common/middleware/authenticate.middleware.js";

const router = Router();
const controller = new AuthController();

router.post("/signup", validate({ body: signupSchema }), controller.signUp);
router.post("/login", validate({ body: loginSchema }), controller.login);
router.post(
  "/forgot-password",
  validate({ body: forgotPasswordSchema }),
  controller.forgotPassword
);
router.post(
  "/reset-password",
  validate({ body: resetPasswordSchema }),
  controller.resetPassword
);
router.post("/change-password", authenticate, controller.changePassword);

export default router;
