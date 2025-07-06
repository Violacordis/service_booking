import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware.js";
import { CoreServiceController } from "./service.controller.js";
import {
  createServicesSchema,
  getServicesQuerySchema,
} from "./service.validator.js";
import { authenticate } from "../common/middleware/authenticate.middleware.js";
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
