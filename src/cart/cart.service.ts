import prismaService from "../../db/prisma.js";
import { Currency } from "../../generated/prisma/index.js";
import { AppError } from "../common/errors/app.error.js";
import { generateShortCode } from "../common/utilities/app.utilities.js";
import logger from "../common/utilities/logger/index.js";

export class CartService {
  addToCart = async (id: string, quantity: number, userId: string) => {
    try {
      const existingCartItem = await prismaService.cartItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId: id,
          },
        },
      });

      const cartItem = existingCartItem
        ? await prismaService.cartItem.update({
            where: {
              userId_productId: {
                userId,
                productId: id,
              },
            },
            data: {
              quantity: existingCartItem.quantity + quantity,
            },
          })
        : await prismaService.cartItem.create({
            data: {
              userId,
              productId: id,
              quantity,
            },
            include: {
              productItem: true,
            },
          });

      return {
        message: "Item added to cart successfully",
        data: cartItem,
      };
    } catch (error: any) {
      logger.error("Error adding item to cart:", error);
      throw new AppError("Failed to add item to cart!", 500);
    }
  };

  removeFromCart = async (id: string, userId: string) => {
    try {
      const cartItem = await prismaService.cartItem.findUnique({
        where: {
          id,
        },
      });

      if (!cartItem) {
        throw new AppError("Cart item not found", 404);
      }

      await prismaService.cartItem.delete({
        where: {
          id,
        },
      });

      return {
        message: "Item removed from cart successfully",
      };
    } catch (error: any) {
      logger.error("Error removing item from cart:", error);
      throw new AppError("Failed to remove item from cart!", 500);
    }
  };

  getUserCartItems = async (req: {
    query: {
      page?: 1 | undefined;
      limit?: 10 | undefined;
      term: any;
      sortBy?: "createdAt" | undefined;
    };
  }) => {
    try {
      const { page = 1, limit = 10, term, sortBy = "createdAt" } = req.query;

      const filters: any = {};

      if (term) {
        const searchTerm = term.toString().trim();
        filters.OR = [
          {
            productItem: {
              name: { contains: searchTerm, mode: "insensitive" },
            },
          },
        ];
      }

      const [total, items] = await Promise.all([
        prismaService.cartItem.count({ where: filters }),
        prismaService.cartItem.findMany({
          where: filters,
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { [sortBy.toString()]: "desc" },
          include: {
            productItem: true,
          },
        }),
      ]);

      return {
        message: "User Cart Items fetched successfully",
        data: items,
        meta: {
          total,
          page: Number(page),
          pageSize: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      };
    } catch (error: any) {
      logger.error("Error fetching user cart items:", error);
      throw new AppError("Failed to fetch user cart items!", 500);
    }
  };

  getUserOrders = async (req: {
    query: {
      page?: 1 | undefined;
      limit?: 10 | undefined;
      term: any;
      sortBy?: "createdAt" | undefined;
    };
    userId: string;
  }) => {
    try {
      const { page = 1, limit = 10, term, sortBy = "createdAt" } = req.query;

      const filters: any = {};

      if (term) {
        const searchTerm = term.toString().trim();
        filters.OR = [
          {
            code: { contains: searchTerm, mode: "insensitive" },
          },
        ];
      }

      filters.userId = req.userId;

      const [total, items] = await Promise.all([
        prismaService.cartItem.count({ where: filters }),
        prismaService.cartItem.findMany({
          where: filters,
          skip: (Number(page) - 1) * Number(limit),
          take: Number(limit),
          orderBy: { [sortBy.toString()]: "desc" },
          include: {
            productItem: true,
          },
        }),
      ]);

      return {
        message: "User Cart Items fetched successfully",
        data: items,
        meta: {
          total,
          page: Number(page),
          pageSize: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      };
    } catch (error: any) {
      logger.error("Error fetching user cart items:", error);
      throw new AppError("Failed to fetch user cart items!", 500);
    }
  };

  updateCartItemQuantity = async (
    id: string,
    quantity: number,
    userId: string
  ) => {
    try {
      const cartItem = await prismaService.cartItem.findUnique({
        where: {
          id,
        },
      });

      if (!cartItem) {
        throw new AppError("Cart item not found", 404);
      }

      const updatedCartItem = await prismaService.cartItem.update({
        where: {
          id,
        },
        data: {
          quantity,
        },
      });

      return {
        message: "Cart item quantity updated successfully",
        data: updatedCartItem,
      };
    } catch (error: any) {
      logger.error("Error updating cart item quantity:", error);
      throw new AppError("Failed to update cart item quantity!", 500);
    }
  };

  clearUserCart = async (userId: string) => {
    try {
      await prismaService.cartItem.deleteMany({
        where: {
          userId,
        },
      });

      return {
        message: "User cart cleared successfully",
      };
    } catch (error: any) {
      logger.error("Error clearing user cart:", error);
      throw new AppError("Failed to clear user cart!", 500);
    }
  };

  checkoutCart = async (
    items: string[],
    totalAmount: number,
    userId: string,
    currency: string,
    note?: string
  ) => {
    if (!items || items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    if (!totalAmount || totalAmount <= 0) {
      throw new AppError("Total amount must be greater than zero", 400);
    }

    const cartItems = await prismaService.cartItem.findMany({
      where: {
        id: { in: items },
      },
      include: {
        productItem: true,
      },
    });

    if (cartItems.length === 0) {
      throw new AppError("No valid cart items found", 404);
    }

    const calculatedTotal = cartItems.reduce((sum, item) => {
      return sum + (item.productItem.price || 0) * item.quantity;
    }, 0);

    if (calculatedTotal !== totalAmount) {
      throw new AppError(
        `Total amount mismatch: expected ${calculatedTotal}, got ${totalAmount}`,
        400
      );
    }

    const order = await prismaService.order.create({
      data: {
        userId,
        totalAmount,
        currency: currency as Currency,
        code: generateShortCode("ORDS"),
        note: note ?? "Order from cart",
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.productItem.price,
          })),
        },
      },
    });

    await this.clearUserCart(userId);
    return {
      success: true,
      message: "Order created. Proceed to payment.",
      data: order,
    };
  };
}
