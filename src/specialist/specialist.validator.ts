import { z } from "zod";

const createSpecialistSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Email must be a valid email address" }),
  phone: z.string().optional(),
  age: z
    .union([
      z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().int({ message: "Age must be a number" })),
      z.number().int({ message: "Age must be a number" }),
    ])
    .optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  aboutMe: z.string().optional(),
  branchId: z
    .string()
    .uuid({ message: "Branch ID must be a valid UUID" })
    .min(1, { message: "Branch ID is required" }),
  description: z.string().optional(),
  categoryIds: z
    .array(
      z.string().uuid({ message: "Each category ID must be a valid UUID" })
    )
    .min(1, { message: "At least one category ID is required" }),
});

const createSpecialistsSchema = z.object({
  specialists: z
    .array(createSpecialistSchema)
    .min(1, { message: "At least one specialist is required" }),
});

const getSpecialistsQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1, { message: "Page must be at least 1" }))
    .default("1"),

  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .int()
        .min(1, { message: "Limit must be at least 1" })
        .max(100, { message: "Limit cannot exceed 100" })
    )
    .default("10"),

  status: z
    .string()
    .transform((val) => val === "true")
    .optional(),

  branchId: z
    .string()
    .uuid({ message: "Branch ID must be a valid UUID" })
    .optional(),

  serviceCategoryId: z
    .string()
    .uuid({ message: "Service Category ID must be a valid UUID" })
    .optional(),

  serviceId: z
    .string()
    .uuid({ message: "Service ID must be a valid UUID" })
    .optional(),

  sortBy: z
    .enum(["name", "email", "createdAt"], {
      message: "SortBy must be one of 'name', 'email', or 'createdAt'",
    })
    .optional()
    .default("createdAt"),

  term: z.string().optional(),
});

export { createSpecialistsSchema, getSpecialistsQuerySchema };
