import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

// export const validate =
//   (schema: ZodSchema<any>) =>
//   (req: Request, res: Response, next: NextFunction): void => {
//     try {
//       schema.parse(req.body);
//       return next();
//     } catch (err) {
//       if (err instanceof ZodError) {
//         res.status(400).json({
//           success: false,
//           message: "Validation failed",
//           errors: err.errors.map((e) => ({
//             path: e.path.join("."),
//             message: e.message,
//           })),
//         });
//         return;
//       }
//       return next(err);
//     }
//   };
export const validate =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const isGet = req.method === "GET";
      const data = isGet ? req.query : req.body;

      const parsed = schema.parse(data);

      // Attach to a safe custom field instead of modifying req.query or req.body directly
      (req as any).validated = parsed;

      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: err.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
        return;
      }
      return next(err);
    }
  };
