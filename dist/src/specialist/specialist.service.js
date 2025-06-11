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
    async createSpecialist(data) {
        try {
            const { categoryIds, branchId, ...specialistData } = data;
            // Check category existence and branch consistency
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
            // Check email uniqueness
            const specialistExists = await prisma_1.default.specialist.findUnique({
                where: { email: data.email },
            });
            if (specialistExists) {
                throw new app_error_1.AppError("Email already exists", 409);
            }
            const createdSpecialist = await prisma_1.default.specialist.create({
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
            return {
                message: "Specialist created successfully",
                data: createdSpecialist,
            };
        }
        catch (error) {
            logger_1.default.error("Error creating specialist:", error);
            throw new app_error_1.AppError(error.message || "Failed to create specialist", error.statusCode || 500);
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
                    skip: (page - 1) * limit,
                    take: limit,
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
                    pageSize: limit,
                    totalPages: Math.ceil(total / limit),
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
