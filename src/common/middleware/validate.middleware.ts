import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

const validate =
  (schema: ZodSchema<any>, source: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      let data: any;

      switch (source) {
        case "query":
          data = req.query;
          break;
        case "params":
          data = req.params;
          break;
        default:
          data = req.body;
      }

      const parsed = schema.parse(data);

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

export { validate };
