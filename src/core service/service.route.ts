import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware.js";
import { CoreServiceController } from "./service.controller.js";
import {
  createServicesSchema,
  getServicesQuerySchema,
  deleteServicesSchema,
  clearAllServicesSchema,
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
router.delete(
  "/",
  validate({ body: deleteServicesSchema }),
  controller.deleteServices
);

router.delete(
  "/clear-all",
  validate({ body: clearAllServicesSchema }),
  controller.clearAllServices
);

export default router;
