import { z } from "zod";

const branchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  status: z.boolean().optional(),
});

const createBranchSchema = z.object({
  branches: z.array(branchSchema).min(1, "At least one branch is required"),
});

const getBranchesQuerySchema = z.object({
  page: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(1).default(1)
  ),
  limit: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(1).max(100).default(10)
  ),
  sortBy: z.preprocess(
    (val) => (typeof val === "string" ? val : undefined),
    z.enum(["createdAt"]).default("createdAt")
  ),
  term: z.preprocess(
    (val) => (typeof val === "string" ? val : undefined),
    z.string().optional()
  ),
});

export { createBranchSchema, getBranchesQuerySchema };
