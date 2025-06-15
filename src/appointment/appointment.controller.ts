import { Request, Response } from "express";
import { AppointmentService } from "./appointment.service";
import { personalBookingSchema } from "./appointment.validator";
import { AppError } from "../common/errors/app.error";

export class AppointmentController {
  private readonly appointmentService = new AppointmentService();

  bookPersonalAppointment = async (req: Request, res: Response) => {
    const validated = personalBookingSchema.parse(req.body);

    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const data = await this.appointmentService.createPersonalBooking({
      userId,
      ...validated,
    });

    res.json(data);
  };
}
