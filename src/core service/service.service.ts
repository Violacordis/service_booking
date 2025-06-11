import prismaService from "../../db/prisma";
import { AppError } from "../common/errors/app.error";
import { generateShortCode } from "../common/utilities/app.utilities";
import logger from "../common/utilities/logger/index";

export class CoreService {
  createServices = async (
    services: Array<{
      name: string;
      description?: string;
      branchId: string;
      categories: Array<{
        name: string;
        description?: string;
        price?: number;
        estimatedTime?: number | null;
        type?: "BASIC" | "STANDARD" | "PREMIUM";
      }>;
    }>
  ) => {
    try {
      if (!services || !Array.isArray(services) || services.length === 0) {
        throw new AppError(
          "Invalid request: 'services' must be a non-empty array",
          400
        );
      }

      const createdServices = await Promise.all(
        services.map(async (service) => {
          const { name, description, branchId, categories } = service;

          return await prismaService.service.create({
            data: {
              name,
              description: description ?? null,
              branch: {
                connect: { id: branchId },
              },
              code: generateShortCode("SRV"),
              categories: {
                create: categories.map((cat) => ({
                  name: cat.name,
                  code: generateShortCode("CAT"),
                  description: cat.description,
                  price: cat.price ?? 0,
                  estimatedTime: cat.estimatedTime ?? null,
                  type: cat.type ?? "BASIC",
                })),
              },
            },
            include: {
              categories: true,
            },
          });
        })
      );

      return {
        message: "Services created successfully",
        data: createdServices,
      };
    } catch (error: any) {
      logger.error("Error creating branches:", error);
      throw new AppError("Failed to create services!", 500);
    }
  };

  getServices = async (req: {
    query: {
      page?: 1 | undefined;
      limit?: 10 | undefined;
      term: any;
      branchId?: string | undefined;
      status?: boolean | undefined;
      sortBy?: "createdAt" | undefined;
    };
  }) => {
    try {
      const {
        page = 1,
        limit = 10,
        term,
        branchId,
        status,
        sortBy = "createdAt",
      } = req.query;

      const filters: any = {};

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
        prismaService.service.count({ where: filters }),
        prismaService.service.findMany({
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
    } catch (error: any) {
      logger.error("Error fetching services:", error);
      throw new AppError("Failed to fetch services!", 500);
    }
  };
}
