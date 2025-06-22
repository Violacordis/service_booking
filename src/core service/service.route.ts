import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware";
import { CoreServiceController } from "./service.controller";
import {
  createServicesSchema,
  getServicesQuerySchema,
} from "./service.validator";
import { authenticate } from "../common/middleware/authenticate.middleware";
const router = Router();
const controller = new CoreServiceController();

router.post("/", validate(createServicesSchema), controller.createServices);
router.get(
  "/",
  authenticate,
  validate(getServicesQuerySchema, "query"),
  controller.getServices
);

export default router;
