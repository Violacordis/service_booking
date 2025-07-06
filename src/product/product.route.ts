import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware.js";
import { CoreServiceController } from "./product.controller.js";
import { authenticate } from "../common/middleware/authenticate.middleware.js";
import {
  createProductsSchema,
  getProductCategoriesQuerySchema,
  getProductItemParamSchemaWithUserId,
  getProductsQuerySchema,
} from "./product.validator.js";
const router = Router();
const controller = new CoreServiceController();

router.post(
  "/",
  validate({ body: createProductsSchema }),
  controller.createProducts
);
router.get(
  "/",
  authenticate,
  validate({ query: getProductsQuerySchema }),
  controller.getProducts
);
router.get(
  "/categories",
  authenticate,
  validate({ query: getProductCategoriesQuerySchema }),
  controller.getProductcategories
);

router.get(
  "/:id",
  authenticate,
  validate({ params: getProductItemParamSchemaWithUserId }),
  controller.getProductsById
);

export default router;
