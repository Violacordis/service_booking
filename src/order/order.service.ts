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

  async getUserOrderById(orderId: string, userId: string) {
    try {
      const order = await prismaService.order.findFirst({
        where: {
          id: orderId,
          userId,
        },
        include: {
          items: true,
          user: {
            select: {
              fullName: true,
              email: true,
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
            },
          },
        },
      });

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      return order;
    } catch (error) {
      logger.error("Error fetching order by ID:", error);
      throw new AppError("Failed to fetch order", 500);
    }
  }

  async getUserOrderItemById(itemId: string, userId: string) {
    try {
      const item = await prismaService.orderItem.findFirst({
        where: {
          id: itemId,
          order: {
            userId,
          },
        },
        include: {
          order: {
            include: {
              user: { select: { fullName: true, email: true, address: true } },
              payment: {
                select: {
                  id: true,
                  amount: true,
                  currency: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      if (!item) {
        throw new AppError("Order Item not found", 404);
      }

      return item;
    } catch (error) {
      logger.error("Error fetching order item by ID:", error);
      throw new AppError("Failed to fetch order item", 500);
    }
  }

  async cancelOrder(orderId: string, userId: string, reason?: string) {
    try {
      const order = await prismaService.order.findFirst({
        where: { id: orderId, userId },
      });

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new AppError("Order is already cancelled", 400);
      }

      if (order.status === OrderStatus.COMPLETED) {
        throw new AppError(
          "Cannot cancel a paid and completed order. Please contact support.",
          400
        );
      }

      return prismaService.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelReason: reason ?? null,
        },
      });
    } catch (error) {
      logger.error("Error cancelling order:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new AppError(`Failed to cancel order: ${errorMessage}`, 500);
    }
  }
}
