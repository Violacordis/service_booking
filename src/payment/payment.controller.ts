import { Request, Response } from "express";
import { PaymentService } from "./payment.service.js";
import { AppError } from "../common/errors/app.error.js";
import {
  AppointmentPaymentSchema,
  CheckOutOrderPaymentSchema,
} from "./payment.validator.js";

export class PaymentController {
  private readonly paymentService = new PaymentService();

  payForAppointment = async (req: Request, res: Response) => {
    const validated = AppointmentPaymentSchema.parse(req.body);

    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const data = await this.paymentService.payForAppointment(
      validated.appointmentId,
      userId
    );

    res.json(data);
  };

  payForCartOrder = async (req: Request, res: Response) => {
    const validated = CheckOutOrderPaymentSchema.parse(req.body);

    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const data = await this.paymentService.payForCartOrder(
      validated.orderId,
      userId
    );

    res.json(data);
  };
}
