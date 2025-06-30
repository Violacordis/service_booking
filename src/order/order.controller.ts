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
}
