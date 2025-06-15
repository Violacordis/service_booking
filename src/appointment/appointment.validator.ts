import { z } from "zod";

const personalBookingSchema = z.object({
  serviceSelections: z
    .array(
      z.object({
        serviceId: z.string().uuid(),
        categoryIds: z.array(z.string().uuid()).min(1),
      })
    )
    .min(1),
  specialistId: z.string().uuid(),
  appointmentDateTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid datetime"),
  branchId: z.string().uuid(),
  totalCost: z.number().min(0, "Total cost must be a positive number"),
  numberOfClients: z.number().int().min(1, "At least one client is required"),
});

export { personalBookingSchema };
