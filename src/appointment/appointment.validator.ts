import { z } from "zod";
import { AppointmentStatus } from "../../generated/prisma";

const bookAppointmentSchema = z.object({
  serviceSelections: z
    .array(
      z.object({
        serviceId: z.string().uuid(),
        categoryIds: z.array(z.string().uuid()).min(1),
      })
    )
    .min(1),
  specialistId: z
    .string()
    .uuid({ message: "Specialist ID must be a valid UUID" }),
  appointmentDateTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid datetime"),
  branchId: z.string().uuid({ message: "Branch ID must be a valid UUID" }),
  totalCost: z.number().min(0, "Total cost must be a positive number"),
  numberOfClients: z.number().int().min(1, "At least one client is required"),
  notes: z.string().optional(),
  currency: z.enum(["usd", "eur", "gbp", "ngn"]).default("gbp"),
});

const getUserAppointmentsQuerySchema = z.object({
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
    .transform((val) => val.toUpperCase())
    .refine(
      (val) =>
        Object.values(AppointmentStatus).includes(val as AppointmentStatus),
      { message: "Invalid status value" }
    )
    .optional(),

  branchId: z
    .string()
    .uuid({ message: "Branch ID must be a valid UUID" })
    .optional(),

  type: z
    .enum(["PERSONAL", "GROUP"], {
      message: "Type must be either 'PERSONAL' or 'GROUP'",
    })
    .optional(),

  paymentStatus: z
    .enum(["PENDING", "SUCCESS", "FAILED"], {
      message:
        "Payment status must be one of 'PENDING', 'SUCCESS', or 'FAILED'",
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

  sortBy: z
    .enum(["name", "email", "createdAt"], {
      message: "SortBy must be one of 'name', 'email', or 'createdAt'",
    })
    .optional()
    .default("createdAt"),

  term: z.string().optional(),
});

const getUserAppointmentsParamSchemaWithUserId = z.object({
  id: z.string().uuid({ message: "Appointment ID must be a valid UUID" }),
});

const cancelAppointmentParamSchema = z.object({
  id: z.string().uuid({ message: "Appointment ID must be a valid UUID" }),
});
const cancelAppointmentBodySchema = z.object({
  reason: z.string().optional(),
});

export {
  bookAppointmentSchema,
  getUserAppointmentsQuerySchema,
  getUserAppointmentsParamSchemaWithUserId,
  cancelAppointmentParamSchema,
  cancelAppointmentBodySchema,
};
