import { Router } from "express";
import { createBranchSchema, getBranchesQuerySchema } from "./branch.validator";
import { validate } from "../common/middleware/validate.middleware";
import { BranchController } from "./branch.controller";
const router = Router();
const controller = new BranchController();

router.post("/", validate(createBranchSchema), controller.createBranches);
router.get("/", validate(getBranchesQuerySchema), controller.fetchBranches);

export default router;
