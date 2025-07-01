import { z } from "zod";
import { OrderStatus } from "../../generated/prisma";

const AddToCartSchema = z.object({
  productId: z.string().uuid({ message: "Product ID must be a valid UUID" }),
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
});

const getUserCartsSchema = z.object({
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

const getUserOrdersSchema = z.object({
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
  status: z
    .string()
    .transform((val) => val.toUpperCase())
    .refine((val) => Object.values(OrderStatus).includes(val as OrderStatus), {
      message: "Invalid status value",
    })
    .optional(),
});

const updateCartItemParamSchema = z.object({
  id: z.string().uuid({ message: "Cart Item ID must be a valid UUID" }),
});

const updateCartItemBodySchema = z.object({
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
});

const checkoutOrderSchema = z.object({
  cartItemIds: z
    .array(z.string().uuid({ message: "Each cartItemId must be a valid UUID" }))
    .nonempty({ message: "cartItemIds must contain at least one item" }),

  totalAmount: z
    .number()
    .positive({ message: "totalAmount must be a positive number" }),

  currency: z.enum(["usd", "eur", "gbp", "ngn"]).default("gbp"),
  note: z.string().optional(),
});

export {
  AddToCartSchema,
  getUserCartsSchema,
  updateCartItemParamSchema,
  updateCartItemBodySchema,
  checkoutOrderSchema,
  getUserOrdersSchema,
};
