import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware";
import { SpecialistController } from "./specialist.controller";
import {
  createSpecialistsSchema,
  getSpecialistsQuerySchema,
} from "./specialist.validator";
const router = Router();

const controller = new SpecialistController();

router.post("/", validate(createSpecialistsSchema), controller.addSpecialists);
router.get("/", validate(getSpecialistsQuerySchema), controller.getSpecialists);

export default router;
