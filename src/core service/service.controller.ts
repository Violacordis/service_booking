import { Request, Response } from "express";
import { CoreService } from "./service.service";

export class CoreServiceController {
  private readonly coreService = new CoreService();

  createServices = async (req: Request, res: Response) => {
    const data = await this.coreService.createServices(
      req.body.services as Array<{
        name: string;
        description?: string;
        branchId: string;
        categories: Array<{
          name: string;
          description?: string;
          price?: number;
          estimatedTime?: number | null;
          type?: "BASIC" | "STANDARD" | "PREMIUM";
        }>;
      }>
    );
    res.json(data);
  };

  getServices = async (req: Request, res: Response) => {
    const data = await this.coreService.getServices({
      query: (req as any).validated.query,
    });
    res.json(data);
  };
}
