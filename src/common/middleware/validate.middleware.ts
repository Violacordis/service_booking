import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

type SchemaMap = Partial<{
  body: ZodSchema<any>;
  params: ZodSchema<any>;
  query: ZodSchema<any>;
}>;

const validate =
  (schemas: SchemaMap) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated: Record<string, any> = {};

      if (schemas.body) {
        validated.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        validated.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        validated.query = schemas.query.parse(req.query);
      }

      // Attach validated data
      (req as any).validated = validated;

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
