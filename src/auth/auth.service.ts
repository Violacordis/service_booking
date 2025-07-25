import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../db/prisma.js";
import { AppError } from "../common/errors/app.error.js";
import config from "../common/config/index.js";
import redis from "../common/cache/index.js";
import { generateOtpCode } from "../common/utilities/app.utilities.js";
import { EmailService } from "../common/mailer.js";

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
        phone,
      },
    });

    await prisma.address.create({
      data: {
        userId: user.id,
        address,
        state,
        country,
        isDefault: true,
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

  async forgotPassword(email: string, emailService: EmailService) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const token = generateOtpCode(6);
    const save = await redis.set(
      `FORGOT_PASS_${token}`,
      JSON.stringify({ token, email, userId: user.id }),
      { ex: 1800 } // 30 minutes
    );

    await emailService.sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      template: "forgot-pass-otp",
      context: {
        userName: user.fullName,
        otp: token,
      },
    });

    return {
      message: "Password reset OTP sent to your email",
    };
  }

  async resetPassword(
    token: string,
    newPassword: string,
    emailService: EmailService
  ) {
    const redisKey = `FORGOT_PASS_${token}`;
    const cachedOtp = await redis.get(redisKey);

    if (!cachedOtp) {
      throw new AppError("OTP expired or invalid", 400);
    }

    const cachedData = JSON.parse(cachedOtp as string);

    const user = await prisma.user.findUnique({
      where: { id: cachedData.userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await redis.del(redisKey);

    await emailService.sendEmail({
      to: user.email,
      subject: "Password Reset Successful",
      template: "reset-confirmed",
      context: {
        userName: user.fullName,
      },
    });

    return {
      message: "Password reset successful",
    };
  }

  static generateToken(userId: string) {
    return jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: config.jwt.expiresIn,
    });
  }
}
