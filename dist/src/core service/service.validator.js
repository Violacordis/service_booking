"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServicesQuerySchema = exports.createServicesSchema = void 0;
const zod_1 = require("zod");
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    description: zod_1.z.string().optional(),
    price: zod_1.z
        .number()
        .min(0, "Price must be greater than or equal to 0")
        .optional(),
    type: zod_1.z.enum(["BASIC", "STANDARD", "PREMIUM"]).optional(),
    estimatedTime: zod_1.z
        .number()
        .min(0, "Estimated time must be greater than or equal to 0")
        .optional(),
});
const serviceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    description: zod_1.z.string().optional(),
    branchId: zod_1.z
        .string()
        .uuid("Invalid branch ID")
        .min(1, "Branch ID is required"),
    categories: zod_1.z
        .array(categorySchema)
        .min(1, "At least one category is required"),
});
const createServicesSchema = zod_1.z.object({
    services: zod_1.z.array(serviceSchema).min(1, "At least one service is required"),
});
exports.createServicesSchema = createServicesSchema;
const getServicesQuerySchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(zod_1.z.number().int().min(1, "Page must be at least 1"))
        .default("1"),
    limit: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(zod_1.z
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100"))
        .default("10"),
    status: zod_1.z
        .string()
        .transform((val) => val === "true")
        .optional(),
    branchId: zod_1.z.string().uuid("Invalid branch ID").optional(),
    sortBy: zod_1.z
        .enum(["name", "email", "createdAt"])
        .optional()
        .default("createdAt"),
    term: zod_1.z.string().optional(),
});
exports.getServicesQuerySchema = getServicesQuerySchema;
