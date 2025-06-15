import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app.error';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(new AppError('Route not found', 404));
};
