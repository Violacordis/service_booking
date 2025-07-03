import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { EmailService } from "../common/mailer";
import { AppError } from "../common/errors/app.error";
import { changePasswordSchema } from "./auth.validator";

export class AuthController {
  private readonly authService = new AuthService();
  private emailService = new EmailService();

  signUp = async (req: Request, res: Response) => {
    const data = await this.authService.signup(
      req.body.fullName,
      req.body.email,
      req.body.password,
      req.body.address,
      req.body.state,
      req.body.country,
      req.body.phone
    );

    res.json(data);
  };

  login = async (req: Request, res: Response) => {
    const data = await this.authService.login(
      req.body.email,
      req.body.password
    );
    res.json(data);
  };

  forgotPassword = async (req: Request, res: Response) => {
    const data = await this.authService.forgotPassword(
      req.body.email,
      this.emailService
    );

    res.json(data);
  };

  resetPassword = async (req: Request, res: Response) => {
    console.log("token", req.body.token);
    const data = await this.authService.resetPassword(
      req.body.token,
      req.body.newPassword,
      this.emailService
    );

    res.json(data);
  };

  changePassword = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized!", 401);
    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success)
      throw new AppError(result.error.errors[0].message, 400);
    const { oldPassword, newPassword } = result.data;
    const data = await this.authService.changePassword(
      userId,
      oldPassword,
      newPassword
    );
    res.json(data);
  };
}
