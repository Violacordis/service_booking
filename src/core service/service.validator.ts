import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z
    .number()
    .min(0, "Price must be greater than or equal to 0")
    .optional(),
  type: z.enum(["BASIC", "STANDARD", "PREMIUM"]).optional(),
  estimatedTime: z
    .number()
    .min(0, "Estimated time must be greater than or equal to 0")
    .optional(),
});

const serviceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  branchId: z
    .string()
    .uuid("Invalid branch ID")
    .min(1, "Branch ID is required"),
  categories: z
    .array(categorySchema)
    .min(1, "At least one category is required"),
});

const createServicesSchema = z.object({
  services: z.array(serviceSchema).min(1, "At least one service is required"),
});

const getServicesQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1, "Page must be at least 1"))
    .default("1"),

  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .int()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit cannot exceed 100")
    )
    .default("10"),

  status: z
    .string()
    .transform((val) => val === "true")
    .optional(),

  branchId: z.string().uuid("Invalid branch ID").optional(),

  sortBy: z
    .enum(["name", "email", "createdAt"])
    .optional()
    .default("createdAt"),

  term: z.string().optional(),
});

const deleteServicesSchema = z.object({
  serviceIds: z
    .array(z.string().uuid({ message: "Each service ID must be a valid UUID" }))
    .min(1, "At least one service ID is required"),
});

const clearAllServicesSchema = z.object({});

export {
  createServicesSchema,
  getServicesQuerySchema,
  deleteServicesSchema,
  clearAllServicesSchema,
};
