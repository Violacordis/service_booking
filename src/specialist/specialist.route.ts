import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware";
import { SpecialistController } from "./specialist.controller";
import {
  createSpecialistsSchema,
  getSpecialistsQuerySchema,
} from "./specialist.validator";
import { authenticate } from "../common/middleware/authenticate.middleware";
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
