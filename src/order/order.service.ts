import prismaService from "../../db/prisma";
import { OrderStatus } from "../../generated/prisma";
import { AppError } from "../common/errors/app.error";
import logger from "../common/utilities/logger/index";

export class OrderService {
  getUserOrders = async (req: {
    query: {
      page?: 1 | undefined;
      limit?: 10 | undefined;
      term: any;
      status?: string;
      sortBy?: "createdAt" | undefined;
      startDate?: string;
      endDate?: string;
    };
    userId: string;
  }) => {
    try {
      const {
        page = 1,
        limit = 10,
        term,
        sortBy = "createdAt",
        status,
        startDate,
        endDate,
      } = req.query;

      const filters: any = {};

      if (term) {
        const searchTerm = term.toString().trim();
        filters.OR = [
          {
            code: { contains: searchTerm, mode: "insensitive" },
          },
        ];
      }

      if (status) {
        filters.status = { equals: status as OrderStatus };
      }

      if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) {
          filters.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
          filters.createdAt.lte = new Date(endDate);
        }
      }

      filters.userId = req.userId;

      const [total, orders] = await Promise.all([
        prismaService.order.count({ where: filters }),
        prismaService.order.findMany({
          where: filters,
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { [sortBy.toString()]: "desc" },
          include: {
            items: true,
          },
        }),
      ]);

      return {
        message: "User orders fetched successfully",
        data: orders,
        meta: {
          total,
          page: Number(page),
          pageSize: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      };
    } catch (error: any) {
      logger.error("Error fetching user orders:", error);
      throw new AppError("Failed to fetch user orders!", 500);
    }
  };
}
