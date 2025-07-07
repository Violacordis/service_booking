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
import {
  uploadSingleImage,
  validateImageUpload,
} from "../common/middleware/upload.middleware.js";
const router = Router();
const controller = new CoreServiceController();

router.post(
  "/",
  validate({ body: createProductsSchema }),
  controller.createProducts
);
router.get(
  "/",
  validate({ query: getProductsQuerySchema }),
  controller.getProducts
);
router.get(
  "/categories",
  validate({ query: getProductCategoriesQuerySchema }),
  controller.getProductcategories
);

router.get(
  "/:id",
  authenticate,
  validate({ params: getProductItemParamSchemaWithUserId }),
  controller.getProductsById
);

router.put(
  "/:id/image",
  uploadSingleImage,
  validateImageUpload,
  controller.updateProductImage
);

export default router;
