import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware";
import { AuthController } from "./auth.controller";
import { loginSchema, signupSchema } from "./auth.validator";
const router = Router();
const controller = new AuthController();

router.post("/signup", validate(signupSchema), controller.signUp);
router.post("/login", validate(loginSchema), controller.login);

export default router;
