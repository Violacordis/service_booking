import { Router } from "express";
import {
  createBranchSchema,
  getBranchesQuerySchema,
  deleteBranchesSchema,
  clearAllBranchesSchema,
} from "./branch.validator.js";
import { validate } from "../common/middleware/validate.middleware.js";
import { BranchController } from "./branch.controller.js";
const router = Router();
const controller = new BranchController();

router.post(
  "/",
  validate({ body: createBranchSchema }),
  controller.createBranches
);
router.get(
  "/",
  validate({ query: getBranchesQuerySchema }),
  controller.fetchBranches
);
router.delete(
  "/",
  validate({ body: deleteBranchesSchema }),
  controller.deleteBranches
);

router.delete(
  "/clear-all",
  validate({ body: clearAllBranchesSchema }),
  controller.clearAllBranches
);

export default router;
