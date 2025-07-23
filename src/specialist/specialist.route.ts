import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware.js";
import { SpecialistController } from "./specialist.controller.js";
import {
  createSpecialistsSchema,
  getSpecialistsQuerySchema,
  getSpecialistByIdParamSchema,
  rateSpecialistParamSchema,
  rateSpecialistBodySchema,
  deleteSpecialistsSchema,
  clearAllSpecialistsSchema,
} from "./specialist.validator.js";
import { authenticate } from "../common/middleware/authenticate.middleware.js";
import {
  uploadSingleImage,
  validateImageUpload,
} from "../common/middleware/upload.middleware.js";

const router = Router();

const controller = new SpecialistController();

router.post(
  "/",
  validate({ body: createSpecialistsSchema }),
  controller.addSpecialists
);
router.get(
  "/",
  validate({ query: getSpecialistsQuerySchema }),
  controller.getSpecialists
);

router.get(
  "/:id",
  validate({ params: getSpecialistByIdParamSchema }),
  controller.getSpecialistById
);

router.post(
  "/:id/rate",
  authenticate,
  validate({
    params: rateSpecialistParamSchema,
    body: rateSpecialistBodySchema,
  }),
  controller.rateSpecialist
);

router.put(
  "/:id/image",
  uploadSingleImage,
  validateImageUpload,
  controller.updateSpecialistImage
);

router.delete(
  "/",
  validate({ body: deleteSpecialistsSchema }),
  controller.deleteSpecialists
);

router.delete(
  "/clear-all",
  validate({ body: clearAllSpecialistsSchema }),
  controller.clearAllSpecialists
);

export default router;
