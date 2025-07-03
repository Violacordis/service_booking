import { z } from "zod";

export const createAddressSchema = z.object({
  address: z.string().min(1, "Address is required"),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = z.object({
  address: z.string().min(1, "Address is required"),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid({ message: "Address ID must be a valid UUID" }),
});
