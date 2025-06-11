"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreService = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const app_error_1 = require("../common/errors/app.error");
const app_utilities_1 = require("../common/utilities/app.utilities");
const index_1 = __importDefault(require("../common/utilities/logger/index"));
class CoreService {
    constructor() {
        this.createServices = async (services) => {
            try {
                if (!services || !Array.isArray(services) || services.length === 0) {
                    throw new app_error_1.AppError("Invalid request: 'services' must be a non-empty array", 400);
                }
                const createdServices = await Promise.all(services.map(async (service) => {
                    const { name, description, branchId, categories } = service;
                    return await prisma_1.default.service.create({
                        data: {
                            name,
                            description: description !== null && description !== void 0 ? description : null,
                            branch: {
                                connect: { id: branchId },
                            },
                            code: (0, app_utilities_1.generateShortCode)("SRV"),
                            categories: {
                                create: categories.map((cat) => {
                                    var _a, _b, _c;
                                    return ({
                                        name: cat.name,
                                        code: (0, app_utilities_1.generateShortCode)("CAT"),
                                        description: cat.description,
                                        price: (_a = cat.price) !== null && _a !== void 0 ? _a : 0,
                                        estimatedTime: (_b = cat.estimatedTime) !== null && _b !== void 0 ? _b : null,
                                        type: (_c = cat.type) !== null && _c !== void 0 ? _c : "BASIC",
                                    });
                                }),
                            },
                        },
                        include: {
                            categories: true,
                        },
                    });
                }));
                return {
                    message: "Services created successfully",
                    data: createdServices,
                };
            }
            catch (error) {
                index_1.default.error("Error creating branches:", error);
                throw new app_error_1.AppError("Failed to create services!", 500);
            }
        };
        this.getServices = async (req) => {
            try {
                const { page = 1, limit = 10, term, branchId, status, sortBy = "createdAt", } = req.query;
                const filters = {};
                if (term) {
                    const searchTerm = term.toString().trim();
                    filters.OR = [
                        { name: { contains: searchTerm, mode: "insensitive" } },
                        {
                            categories: {
                                some: {
                                    name: { contains: searchTerm, mode: "insensitive" },
                                },
                            },
                        },
                    ];
                }
                if (status !== undefined) {
                    filters.status = status === true;
                }
                if (branchId) {
                    filters.branchId = branchId.toString();
                }
                const [total, services] = await Promise.all([
                    prisma_1.default.service.count({ where: filters }),
                    prisma_1.default.service.findMany({
                        where: filters,
                        skip: (Number(page) - 1) * Number(limit),
                        take: Number(limit),
                        orderBy: { [sortBy.toString()]: "desc" },
                        include: {
                            categories: {
                                select: {
                                    id: true,
                                    name: true,
                                    type: true,
                                    price: true,
                                    estimatedTime: true,
                                    specialists: {
                                        select: {
                                            id: true,
                                            specialistId: true,
                                            categoryId: true,
                                            specialist: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                    email: true,
                                                    phone: true,
                                                    status: true,
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
                    message: "Services fetched successfully",
                    data: services,
                    meta: {
                        total,
                        page: Number(page),
                        pageSize: Number(limit),
                        totalPages: Math.ceil(total / Number(limit)),
                    },
                };
            }
            catch (error) {
                index_1.default.error("Error fetching services:", error);
                throw new app_error_1.AppError("Failed to fetch services!", 500);
            }
        };
    }
}
exports.CoreService = CoreService;
