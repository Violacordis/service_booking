import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware";
import { CoreServiceController } from "./service.controller";
import {
  createServicesSchema,
  getServicesQuerySchema,
} from "./service.validator";
const router = Router();
const controller = new CoreServiceController();

router.post("/", validate(createServicesSchema), controller.createServices);
router.get("/", validate(getServicesQuerySchema), controller.getServices);

export default router;
