import { Router } from "express";
import { createBranchSchema, getBranchesQuerySchema } from "./branch.validator";
import { validate } from "../common/middleware/validate.middleware";
import { BranchController } from "./branch.controller";
import { authenticate } from "../common/middleware/authenticate.middleware";
const router = Router();
const controller = new BranchController();

router.post(
  "/",
  validate({ body: createBranchSchema }),
  controller.createBranches
);
router.get(
  "/",
  authenticate,
  validate({ query: getBranchesQuerySchema }),
  controller.fetchBranches
);

export default router;
