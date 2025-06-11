"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecialistsQuerySchema = exports.createSpecialistSchema = void 0;
const zod_1 = require("zod");
const createSpecialistSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, { message: "Name is required" }),
    email: zod_1.z.string().email({ message: "Email must be a valid email address" }),
    phone: zod_1.z.string().optional(),
    age: zod_1.z
        .number()
        .int({ message: "Age must be a number" })
        .min(18, { message: "Age must be at least 18" })
        .optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    aboutMe: zod_1.z.string().optional(),
    branchId: zod_1.z
        .string()
        .uuid({ message: "Branch ID must be a valid UUID" })
        .min(1, { message: "Branch ID is required" }),
    description: zod_1.z.string().optional(),
    categoryIds: zod_1.z
        .array(zod_1.z.string().uuid({ message: "Each category ID must be a valid UUID" }))
        .min(1, { message: "At least one category ID is required" }),
});
exports.createSpecialistSchema = createSpecialistSchema;
const getSpecialistsQuerySchema = zod_1.z.object({
    page: zod_1.z
        .number()
        .int()
        .min(1, { message: "Page must be at least 1" })
        .default(1),
    limit: zod_1.z
        .number()
        .int()
        .min(1, { message: "Limit must be at least 1" })
        .max(100, { message: "Limit cannot exceed 100" })
        .default(10),
    status: zod_1.z.boolean().optional(),
    branchId: zod_1.z
        .string()
        .uuid({ message: "Branch ID must be a valid UUID" })
        .optional(),
    saviceCategoryId: zod_1.z
        .string()
        .uuid({ message: "Service Category ID must be a valid UUID" })
        .optional(),
    serviceId: zod_1.z
        .string()
        .uuid({ message: "Service ID must be a valid UUID" })
        .optional(),
    sortBy: zod_1.z
        .enum(["name", "email", "createdAt"], {
        message: "SortBy must be one of 'name', 'email', or 'createdAt'",
    })
        .default("createdAt"),
    term: zod_1.z.string().optional(),
});
exports.getSpecialistsQuerySchema = getSpecialistsQuerySchema;
