import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware.js";
import { SpecialistController } from "./specialist.controller.js";
import {
  createSpecialistsSchema,
  getSpecialistsQuerySchema,
} from "./specialist.validator.js";
import { authenticate } from "../common/middleware/authenticate.middleware.js";
const router = Router();

const controller = new SpecialistController();

router.post(
  "/",
  validate({ body: createSpecialistsSchema }),
  controller.addSpecialists
);
router.get(
  "/",
  authenticate,
  validate({ query: getSpecialistsQuerySchema }),
  controller.getSpecialists
);

export default router;
