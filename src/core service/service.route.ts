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

router.post(
  "/",
  validate({ body: createServicesSchema }),
  controller.createServices
);
router.get(
  "/",
  authenticate,
  validate({ query: getServicesQuerySchema }),
  controller.getServices
);

export default router;
