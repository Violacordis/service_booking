import { z } from "zod";
import { OrderStatus } from "../../generated/prisma/index.js";

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
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid start date")
    .optional(),

  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid end date")
    .optional(),
});

const getUserOrderParamSchemaWithUserId = z.object({
  id: z.string().uuid({ message: "Order ID must be a valid UUID" }),
});

const cancelOrderParamSchema = z.object({
  id: z.string().uuid({ message: "Order ID must be a valid UUID" }),
});
const cancelOrderBodySchema = z.object({
  reason: z.string().optional(),
});

export {
  getUserOrdersSchema,
  getUserOrderParamSchemaWithUserId,
  cancelOrderParamSchema,
  cancelOrderBodySchema,
};
