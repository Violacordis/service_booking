import { Request, Response } from "express";
import { OrderService } from "./order.service";
import { AppError } from "../common/errors/app.error";

export class OrderController {
  private readonly orderService = new OrderService();

  getUserOrders = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }
    const data = await this.orderService.getUserOrders({
      query: (req as any).validated.query,
      userId,
    });
    res.json(data);
  };

  getUserOrderId = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const orderId = req.params.id;
    if (!orderId) {
      throw new AppError("Order ID is required", 400);
    }

    const data = await this.orderService.getUserOrderById(orderId, userId);

    res.json(data);
  };

  getUserOrderItemId = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const itemId = req.params.id;
    if (!itemId) {
      throw new AppError("Order item ID is required", 400);
    }

    const data = await this.orderService.getUserOrderItemById(itemId, userId);

    res.json(data);
  };

  cancelAppointment = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const orderId = req.params.id;
    const reason = req.body?.reason;
    if (!orderId) {
      throw new AppError("Order ID is required", 400);
    }

    const data = await this.orderService.cancelOrder(orderId, userId, reason);

    res.json(data);
  };
}
