import { Router } from "express";
import {
  createBranchSchema,
  getBranchesQuerySchema,
} from "./branch.validator.js";
import { validate } from "../common/middleware/validate.middleware.js";
import { BranchController } from "./branch.controller.js";
import { authenticate } from "../common/middleware/authenticate.middleware.js";
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
