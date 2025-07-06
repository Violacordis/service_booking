import { Request, Response } from "express";
import { SpecialistService } from "./specialist.service.js";
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
}
