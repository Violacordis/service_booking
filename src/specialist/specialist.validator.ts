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

const getSpecialistByIdParamSchema = z.object({
  id: z.string().uuid({ message: "Specialist ID must be a valid UUID" }),
});

const rateSpecialistParamSchema = z.object({
  id: z.string().uuid({ message: "Specialist ID must be a valid UUID" }),
});

const rateSpecialistBodySchema = z.object({
  rating: z
    .number()
    .min(1, { message: "Rating must be at least 1" })
    .max(5, { message: "Rating cannot exceed 5" }),
  comment: z
    .string()
    .max(500, { message: "Comment cannot exceed 500 characters" })
    .optional(),
  appointmentId: z
    .string()
    .uuid({ message: "Appointment ID must be a valid UUID" }),
});

const deleteSpecialistsSchema = z.object({
  specialistIds: z
    .array(
      z.string().uuid({ message: "Each specialist ID must be a valid UUID" })
    )
    .min(1, "At least one specialist ID is required"),
});

const clearAllSpecialistsSchema = z.object({});

export {
  createSpecialistsSchema,
  getSpecialistsQuerySchema,
  getSpecialistByIdParamSchema,
  rateSpecialistParamSchema,
  rateSpecialistBodySchema,
  deleteSpecialistsSchema,
  clearAllSpecialistsSchema,
};
