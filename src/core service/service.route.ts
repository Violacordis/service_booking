import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware.js";
import { CoreServiceController } from "./service.controller.js";
import {
  createServicesSchema,
  getServicesQuerySchema,
} from "./service.validator.js";
const router = Router();
const controller = new CoreServiceController();

router.post(
  "/",
  validate({ body: createServicesSchema }),
  controller.createServices
);
router.get(
  "/",
  validate({ query: getServicesQuerySchema }),
  controller.getServices
);

export default router;
