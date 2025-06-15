import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../db/prisma";
import { AppError } from "../common/errors/app.error";
import config from "../common/config";

const JWT_SECRET = config.jwt.secret || process.env.JWT_SECRET;

export class AuthService {
  async signup(
    fullName: string,
    email: string,
    password: string,
    address: string,
    state: string,
    country: string,
    phone: string
  ) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError("User already exists", 409);

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashed,
        address,
        state,
        country,
        phone,
      },
    });

    const token = AuthService.generateToken(user.id);

    const { password: _password, ...safeUser } = user;

    return {
      message: "User created successfully",
      token,
      user: safeUser,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("Invalid credentials", 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new AppError("Invalid credentials", 401);

    const token = AuthService.generateToken(user.id);
    const { password: _password, ...safeUser } = user;

    return {
      message: "Login successful",
      token,
      user: safeUser,
    };
  }

  static generateToken(userId: string) {
    return jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: config.jwt.expiresIn,
    });
  }
}
