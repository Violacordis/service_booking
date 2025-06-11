"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
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
const validate = (schema) => (req, res, next) => {
    try {
        // ❌ This is wrong for GET requests
        // schema.parse(req.body);
        // ✅ Detect whether to parse query or body
        const data = req.method === "GET" ? req.query : req.body;
        const parsed = schema.parse(data);
        // Optionally assign parsed result back to req
        if (req.method === "GET") {
            req.query = parsed;
        }
        else {
            req.body = parsed;
        }
        return next();
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
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
exports.validate = validate;
