import { Request, Response } from "express";
import { AppointmentService } from "./appointment.service.js";
import { bookAppointmentSchema } from "./appointment.validator.js";
import { AppError } from "../common/errors/app.error.js";
import { AppointmentType } from "../../generated/prisma/index.js";

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
      serviceSelections: validated.serviceSelections as {
        serviceId: string;
        categoryIds: string[];
      }[],
      specialistId: validated.specialistId,
      appointmentDateTime: validated.appointmentDateTime,
      branchId: validated.branchId,
      totalCost: validated.totalCost,
      notes: validated.notes,
      currency: validated.currency,
      numberOfClients: validated.numberOfClients,
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
      serviceSelections: validated.serviceSelections as {
        serviceId: string;
        categoryIds: string[];
      }[],
      specialistId: validated.specialistId,
      appointmentDateTime: validated.appointmentDateTime,
      branchId: validated.branchId,
      totalCost: validated.totalCost,
      notes: validated.notes,
      currency: validated.currency,
      numberOfClients: validated.numberOfClients,
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

  completeAppointment = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized!", 401);
    }

    const appointmentId = req.params.id;
    if (!appointmentId) {
      throw new AppError("Appointment ID is required", 400);
    }

    const data = await this.appointmentService.completeAppointment(
      appointmentId,
      userId
    );

    res.json(data);
  };
}
