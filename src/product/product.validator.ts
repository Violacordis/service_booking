import { z } from "zod";
import { Currency } from "../../generated/prisma";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z
    .number()
    .min(0, "Price must be greater than or equal to 0")
    .optional(),
  currency: z.enum(["usd", "eur", "gbp", "ngn"]).default("gbp"),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

const productCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  items: z.array(productSchema).min(1, "At least one category is required"),
});

const createProductsSchema = z.object({
  categories: z
    .array(productCategorySchema)
    .min(1, "At least one product category is required"),
});

const getProductsQuerySchema = z.object({
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

  categoryId: z.string().uuid("Invalid category id").optional(),

  sortBy: z
    .enum(["name", "email", "createdAt"])
    .optional()
    .default("createdAt"),

  term: z.string().optional(),
});

const getProductCategoriesQuerySchema = z.object({
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

  sortBy: z
    .enum(["name", "email", "createdAt"])
    .optional()
    .default("createdAt"),

  term: z.string().optional(),
});

const getProductItemParamSchemaWithUserId = z.object({
  id: z.string().uuid({ message: "Product ID must be a valid UUID" }),
});

export {
  createProductsSchema,
  getProductsQuerySchema,
  getProductCategoriesQuerySchema,
  getProductItemParamSchemaWithUserId,
};
