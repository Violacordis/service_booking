import { Request, Response } from "express";
import { AuthService } from "./auth.service";

export class AuthController {
  private readonly authService = new AuthService();

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
}
