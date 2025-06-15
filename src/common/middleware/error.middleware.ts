import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error";
import logger from "../utilities/logger";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    logger.error(`[Handled] ${message}`);
  } else {
    logger.error(`[Unhandled] ${err.message}`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    data: null,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
