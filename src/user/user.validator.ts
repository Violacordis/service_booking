import { z } from "zod";

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, { message: "Old password is required" }),
  newPassword: z
    .string()
    .min(6, { message: "New password must be at least 6 characters" }),
});

export const updateUserProfileSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: "Full name must be at least 2 characters long" })
      .max(100, { message: "Full name must not exceed 100 characters" })
      .optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, {
        message: "Please provide a valid phone number",
      })
      .optional(),
  })
  .refine((data) => data.fullName || data.phone, {
    message: "At least one field (fullName or phone) must be provided",
  });
