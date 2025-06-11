"use strict";
const prisma = require("../../db/prisma.js");
const { generateShortCode } = require("../utilities/app.utilities.js");
exports.createServices = async (req, res, next) => {
    const services = req.body;
    if (!services || !Array.isArray(services) || services.length === 0) {
        return res.status(400).json({
            message: "Invalid request: 'services' must be a non-empty array",
        });
    }
    try {
        const createdServices = await Promise.all(services.map(async (service) => {
            const { name, description, branchId, categories } = service;
            const createdService = await prisma.service.create({
                data: {
                    name,
                    description: description !== null && description !== void 0 ? description : null,
                    branch: {
                        connect: { id: branchId },
                    },
                    code: generateShortCode("SRV"),
                    categories: {
                        create: categories.map((cat) => {
                            var _a, _b;
                            return ({
                                name: cat.name,
                                code: generateShortCode("CAT"),
                                description: cat.description,
                                price: (_a = cat.price) !== null && _a !== void 0 ? _a : 0,
                                estimatedTime: (_b = cat.estimatedTime) !== null && _b !== void 0 ? _b : null,
                            });
                        }),
                    },
                },
                include: {
                    categories: true,
                },
            });
            return createdService;
        }));
        return res.status(201).json({
            message: "Services created successfully",
            data: createdServices,
        });
    }
    catch (error) {
        console.error("Error creating services:", error.message);
        return res.status(500).json({ message: "Failed to create services" });
    }
};
exports.getServices = async (req, res) => {
    const { page = 1, limit = 10, term, branchId, status, sortBy = "createdAt", } = req.query;
    const filters = {};
    if (term) {
        const searchTerm = term.trim();
        if (searchTerm) {
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
    }
    if (status !== undefined) {
        filters.status = status === "true";
    }
    if (branchId) {
        filters.specialties = {
            branchId,
        };
    }
    try {
        const [total, services] = await Promise.all([
            await prisma.service.count({ where: filters }),
            await prisma.service.findMany({
                where: filters,
                skip: (page - 1) * limit,
                take: parseInt(limit),
                orderBy: { [sortBy]: "desc" },
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
        res.json({
            message: "Services fetched successfully",
            data: services,
            meta: {
                total,
                page: parseInt(page),
                pageSize: parseInt(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error("Error fetching services:", error.message);
        res.status(500).json({ message: "Failed to fetch services" });
    }
};
