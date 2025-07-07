import { Request, Response } from "express";
import { SpecialistService } from "./specialist.service.js";
import { AppError } from "../common/errors/app.error.js";

export class SpecialistController {
  private readonly specialistService = new SpecialistService();

  addSpecialists = async (req: Request, res: Response) => {
    const data = await this.specialistService.addSpecialists(
      req.body.specialists
    );
    res.json(data);
  };

  getSpecialists = async (req: Request, res: Response) => {
    const data = await this.specialistService.getSpecialists({
      query: (req as any).validated.query,
    });
    res.json(data);
  };

  getSpecialistById = async (req: Request, res: Response) => {
    const specialistId = (req as any).validated.params.id;

    const data = await this.specialistService.getSpecialistById(specialistId);
    res.json(data);
  };

  rateSpecialist = async (req: Request, res: Response) => {
    const specialistId = (req as any).validated.params.id;
    const { rating, comment, appointmentId } = (req as any).validated.body;

    const clientId = (req as any).user?.id;

    if (!clientId) {
      throw new AppError("Authentication required", 401);
    }

    const data = await this.specialistService.rateSpecialist(
      specialistId,
      clientId,
      appointmentId,
      rating,
      comment
    );
    res.json(data);
  };

  updateSpecialistImage = async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError("No image file provided", 400);
    }

    const specialistId = req.params.id;
    if (!specialistId) {
      throw new AppError("Specialist ID is required", 400);
    }

    const data = await this.specialistService.updateSpecialistImage(
      specialistId,
      req.file.buffer
    );
    res.json(data);
  };
}
