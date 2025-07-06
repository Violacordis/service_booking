import prismaService from "../../db/prisma.js";
import { AppError } from "../common/errors/app.error.js";
import logger from "../common/utilities/logger/index.js";

export class SpecialistService {
  async addSpecialists(
    specialists: Array<{
      name: string;
      email: string;
      branchId: string;
      categoryIds: string[];
      phone?: string;
      age?: number;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      aboutMe?: string;
      description?: string;
    }>
  ) {
    if (
      !specialists ||
      !Array.isArray(specialists) ||
      specialists.length === 0
    ) {
      throw new AppError(
        "Invalid request: 'specialists' must be a non-empty array",
        400
      );
    }

    try {
      const results = await Promise.all(
        specialists.map(async (data) => {
          const { categoryIds, branchId, ...specialistData } = data;

          // Validate categories
          const categories = await prismaService.serviceCategory.findMany({
            where: { id: { in: categoryIds } },
            select: {
              id: true,
              service: { select: { branchId: true } },
            },
          });

          if (categories.length !== categoryIds.length) {
            throw new AppError("Invalid category IDs provided", 400);
          }

          const invalidCategory = categories.find(
            (cat) => cat.service.branchId !== branchId
          );

          if (invalidCategory) {
            throw new AppError(
              "All categories must belong to the specified branch",
              400
            );
          }

          // Validate email uniqueness
          const existing = await prismaService.specialist.findUnique({
            where: { email: data.email },
          });

          if (existing) {
            throw new AppError(`Email ${data.email} already exists`, 409);
          }

          // Create specialist
          const created = await prismaService.specialist.create({
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
        })
      );

      return {
        message: "Specialists created successfully",
        data: results,
      };
    } catch (error: any) {
      logger.error("Error creating specialists:", error);
      throw new AppError(
        error.message || "Failed to create specialists",
        error.statusCode || 500
      );
    }
  }

  async getSpecialists(req: {
    query: {
      page?: number;
      limit?: number;
      term?: string;
      branchId?: string;
      status?: boolean;
      serviceCategoryId?: string;
      serviceId?: string;
      sortBy?: string;
    };
  }) {
    try {
      const {
        page = 1,
        limit = 10,
        term,
        branchId,
        status,
        serviceCategoryId,
        serviceId,
        sortBy = "createdAt",
      } = req.query;

      const filters: any = {};

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
        prismaService.specialist.count({ where: filters }),
        prismaService.specialist.findMany({
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
    } catch (error: any) {
      logger.error("Error fetching specialists:", error);
      throw new AppError("Failed to fetch specialists", 500);
    }
  }
}
