import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware.js";
import { CartController } from "./cart.controller.js";
import { authenticate } from "../common/middleware/authenticate.middleware.js";
import {
  AddToCartSchema,
  checkoutOrderSchema,
  getUserCartsSchema,
  updateCartItemBodySchema,
  updateCartItemParamSchema,
} from "./cart.validator.js";
const router = Router();
const controller = new CartController();

router.post(
  "/add",
  authenticate,
  validate({ body: AddToCartSchema }),
  controller.addToCart
);
router.post(
  "/checkout",
  authenticate,
  validate({ body: checkoutOrderSchema }),
  controller.checkoutCart
);
router.get(
  "/",
  authenticate,
  validate({ query: getUserCartsSchema }),
  controller.getUserCartItems
);
router.patch(
  "/:id/quantity",
  authenticate,
  validate({
    params: updateCartItemParamSchema,
    body: updateCartItemBodySchema,
  }),
  controller.updateCartItemQuantity
);

router.delete(
  "/:id/remove",
  authenticate,
  validate({ params: updateCartItemParamSchema }),
  controller.removeCartItem
);

router.delete("/clear", authenticate, controller.clearUserCart);

export default router;
