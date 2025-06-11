import { z } from "zod";

// Shared
const email = z.string().email();
const password = z.string().min(6, "Password must be at least 6 characters");

// Signup schema
const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email,
  password,
  address: z.string().min(1, "Address is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  phone: z
    .string()
    .min(7, "Phone number is too short")
    .max(15, "Phone number is too long")
    .optional(),
});

// Login schema
const loginSchema = z.object({
  email,
  password,
});

export { signupSchema, loginSchema };
