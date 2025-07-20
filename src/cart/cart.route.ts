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
  MergeCartSchema,
} from "./cart.validator.js";
const router = Router();
const controller = new CartController();

router.post("/add", validate({ body: AddToCartSchema }), controller.addToCart);

router.post(
  "/merge",
  authenticate,
  validate({ body: MergeCartSchema }),
  controller.mergeGuestCart
);

router.post(
  "/checkout",
  authenticate,
  validate({ body: checkoutOrderSchema }),
  controller.checkoutCart
);

router.get(
  "/",
  validate({ query: getUserCartsSchema }),
  controller.getUserCartItems
);

router.patch(
  "/:id/quantity",
  validate({
    params: updateCartItemParamSchema,
    body: updateCartItemBodySchema,
  }),
  controller.updateCartItemQuantity
);

router.delete(
  "/:id/remove",
  validate({ params: updateCartItemParamSchema }),
  controller.removeCartItem
);

router.delete("/clear", controller.clearUserCart);

export default router;
