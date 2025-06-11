"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialistService = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const app_error_1 = require("../common/errors/app.error");
const logger_1 = __importDefault(require("../common/utilities/logger"));
class SpecialistService {
    async addSpecialists(specialists) {
        if (!specialists ||
            !Array.isArray(specialists) ||
            specialists.length === 0) {
            throw new app_error_1.AppError("Invalid request: 'specialists' must be a non-empty array", 400);
        }
        try {
            const results = await Promise.all(specialists.map(async (data) => {
                const { categoryIds, branchId, ...specialistData } = data;
                // Validate categories
                const categories = await prisma_1.default.serviceCategory.findMany({
                    where: { id: { in: categoryIds } },
                    select: {
                        id: true,
                        service: { select: { branchId: true } },
                    },
                });
                if (categories.length !== categoryIds.length) {
                    throw new app_error_1.AppError("Invalid category IDs provided", 400);
                }
                const invalidCategory = categories.find((cat) => cat.service.branchId !== branchId);
                if (invalidCategory) {
                    throw new app_error_1.AppError("All categories must belong to the specified branch", 400);
                }
                // Validate email uniqueness
                const existing = await prisma_1.default.specialist.findUnique({
                    where: { email: data.email },
                });
                if (existing) {
                    throw new app_error_1.AppError(`Email ${data.email} already exists`, 409);
                }
                // Create specialist
                const created = await prisma_1.default.specialist.create({
                    data: {
                        ...specialistData,
                        branch: { connect: { id: branchId } },
                        specialties: {
                            create: categoryIds.map((id) => ({
                                category: { connect: { id } },
                            })),
                        },
                    },
                    include: { specialties: true },
                });
                return created;
            }));
            return {
                message: "Specialists created successfully",
                data: results,
            };
        }
        catch (error) {
            logger_1.default.error("Error creating specialists:", error);
            throw new app_error_1.AppError(error.message || "Failed to create specialists", error.statusCode || 500);
        }
    }
    async getSpecialists(req) {
        try {
            const { page = 1, limit = 10, term, branchId, status, serviceCategoryId, serviceId, sortBy = "createdAt", } = req.query;
            const filters = {};
            // Search term filter
            if (term) {
                const searchTerm = term.trim();
                filters.OR = [
                    { name: { contains: searchTerm, mode: "insensitive" } },
                    { email: { contains: searchTerm, mode: "insensitive" } },
                    { phone: { contains: searchTerm, mode: "insensitive" } },
                    {
                        specialties: {
                            some: {
                                category: {
                                    name: { contains: searchTerm, mode: "insensitive" },
                                },
                            },
                        },
                    },
                ];
            }
            // Status filter
            if (status !== undefined) {
                filters.status = status;
            }
            // Branch filter
            if (branchId) {
                filters.branchId = branchId;
            }
            // Service category filter
            if (serviceCategoryId) {
                filters.specialties = {
                    some: { categoryId: serviceCategoryId },
                };
            }
            // Service filter
            if (serviceId) {
                filters.specialties = {
                    some: {
                        category: { serviceId },
                    },
                };
            }
            const [total, specialists] = await Promise.all([
                prisma_1.default.specialist.count({ where: filters }),
                prisma_1.default.specialist.findMany({
                    where: filters,
                    skip: (page - 1) * Number(limit),
                    take: Number(limit),
                    orderBy: { [sortBy]: "desc" },
                    include: {
                        specialties: {
                            select: {
                                id: true,
                                category: {
                                    select: {
                                        id: true,
                                        name: true,
                                        type: true,
                                        price: true,
                                        estimatedTime: true,
                                        service: {
                                            select: {
                                                id: true,
                                                name: true,
                                                description: true,
                                                branchId: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                }),
            ]);
            return {
                message: "Specialists fetched successfully",
                data: specialists,
                meta: {
                    total,
                    page,
                    pageSize: Number(limit),
                    totalPages: Math.ceil(total / Number(limit)),
                },
            };
        }
        catch (error) {
            logger_1.default.error("Error fetching specialists:", error);
            throw new app_error_1.AppError("Failed to fetch specialists", 500);
        }
    }
}
exports.SpecialistService = SpecialistService;
