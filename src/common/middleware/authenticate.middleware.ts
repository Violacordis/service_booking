import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app.error.js";
import jwt from "jsonwebtoken";
import logger from "../utilities/logger/index.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Unauthorized!", 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      email: string;
    };

    req.user = {
      id: payload.userId,
      email: payload.email,
    };
    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    throw new AppError("Unauthorized!", 401);
  }
};
