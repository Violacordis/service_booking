import { Request, Response } from "express";
import { BranchService } from "./branch.service.js";

export class BranchController {
  private readonly branchService = new BranchService();

  createBranches = async (req: Request, res: Response) => {
    const data = await this.branchService.createBranches(
      req.body.branches as Array<{
        name: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
      }>
    );
    res.json(data);
  };

  fetchBranches = async (req: Request, res: Response) => {
    const data = await this.branchService.getBranches({
      query: (req as any).validated.query,
    });
    res.json(data);
  };
}
