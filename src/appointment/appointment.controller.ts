import { Request, Response } from "express";
import { AppointmentService } from "./appointment.service";
import { bookAppointmentSchema } from "./appointment.validator";
import { AppError } from "../common/errors/app.error";
import { AppointmentType } from "../../generated/prisma";

export class AppointmentController {
  private readonly appointmentService = new AppointmentService();

  bookPersonalAppointment = async (req: Request, res: Response) => {
    const validated = bookAppointmentSchema.parse(req.body);

    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const data = await this.appointmentService.bookAppointment({
      userId,
      ...validated,
      type: AppointmentType.PERSONAL,
    });

    res.json(data);
  };

  bookGroupAppointment = async (req: Request, res: Response) => {
    const validated = bookAppointmentSchema.parse(req.body);

    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const data = await this.appointmentService.bookAppointment({
      userId,
      ...validated,
      type: AppointmentType.GROUP,
    });

    res.json(data);
  };

  getAppointments = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const data = await this.appointmentService.getUserAppointments({
      query: (req as any).validated.query,
      userId,
    });

    res.json(data);
  };

  getUserAppointmentById = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const appointmentId = req.params.id;
    if (!appointmentId) {
      throw new AppError("Appointment ID is required", 400);
    }

    const data = await this.appointmentService.getUserAppointmentById(
      appointmentId,
      userId
    );

    res.json(data);
  };

  cancelAppointment = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const appointmentId = req.params.id;
    const reason = req.body?.reason;
    if (!appointmentId) {
      throw new AppError("Appointment ID is required", 400);
    }

    const data = await this.appointmentService.cancelAppointment(
      appointmentId,
      userId,
      reason
    );

    res.json(data);
  };
}
