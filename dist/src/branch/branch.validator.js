"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchesQuerySchema = exports.createBranchSchema = void 0;
const zod_1 = require("zod");
const branchSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    status: zod_1.z.boolean().optional(),
});
const createBranchSchema = zod_1.z.object({
    branches: zod_1.z.array(branchSchema).min(1, "At least one branch is required"),
});
exports.createBranchSchema = createBranchSchema;
const getBranchesQuerySchema = zod_1.z.object({
    page: zod_1.z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number().int().min(1).default(1)),
    limit: zod_1.z.preprocess((val) => (typeof val === "string" ? parseInt(val, 10) : val), zod_1.z.number().int().min(1).max(100).default(10)),
    sortBy: zod_1.z.preprocess((val) => (typeof val === "string" ? val : undefined), zod_1.z.enum(["createdAt"]).default("createdAt")),
    term: zod_1.z.preprocess((val) => (typeof val === "string" ? val : undefined), zod_1.z.string().optional()),
});
exports.getBranchesQuerySchema = getBranchesQuerySchema;
