"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchService = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const app_error_1 = require("../common/errors/app.error");
const index_1 = __importDefault(require("../common/utilities/logger/index"));
class BranchService {
    async createBranches(branches) {
        if (!branches || !Array.isArray(branches) || branches.length === 0) {
            throw new app_error_1.AppError("Invalid request: 'branches' must be a non-empty array", 400);
        }
        try {
            const createdBranches = await Promise.all(branches.map(async (branch) => {
                const { name, address, city, state, country } = branch;
                const createdBranch = await prisma_1.default.branch.create({
                    data: {
                        name,
                        address: address !== null && address !== void 0 ? address : null,
                        city: city !== null && city !== void 0 ? city : null,
                        state: state !== null && state !== void 0 ? state : null,
                        country: country !== null && country !== void 0 ? country : null,
                    },
                });
                return createdBranch;
            }));
            return {
                message: "Branches created successfully",
                data: createdBranches,
            };
        }
        catch (error) {
            index_1.default.error("Error creating branches:", error);
            throw new app_error_1.AppError("Failed to create branches!", 500);
        }
    }
    /**
     * Fetches branches with pagination, filtering, and sorting.
     * @param {Object} req - The request object containing query parameters.
     * @param {Object} res - The response object to send the result.
     */
    async getBranches(req) {
        const { page = 1, limit = 10, term, sortBy = "createdAt" } = req.query;
        const filters = {};
        if (term) {
            const searchTerm = term.trim();
            if (searchTerm) {
                filters.OR = [{ name: { contains: searchTerm, mode: "insensitive" } }];
            }
        }
        try {
            const [total, branches] = await Promise.all([
                await prisma_1.default.branch.count({ where: filters }),
                await prisma_1.default.branch.findMany({
                    where: filters,
                    orderBy: {
                        [sortBy]: "desc",
                    },
                    skip: (page - 1) * limit,
                    take: Number(limit),
                }),
            ]);
            return {
                message: "Branches fetched successfully",
                data: branches,
                meta: {
                    total,
                    page: Number(page),
                    pageSize: Number(limit),
                    totalPages: Math.ceil(total / limit),
                },
            };
        }
        catch (error) {
            index_1.default.error("Error fetching branches:", error);
            throw new app_error_1.AppError("Failed to fetch branches!", 500);
        }
    }
}
exports.BranchService = BranchService;
