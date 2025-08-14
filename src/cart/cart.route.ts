import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware.js";
import { CartController } from "./cart.controller.js";
import {
  authenticate,
  optionalAuth,
} from "../common/middleware/authenticate.middleware.js";
import {
  AddToCartSchema,
  checkoutOrderSchema,
  getUserCartsSchema,
  updateCartItemBodySchema,
  updateCartItemParamSchema,
  MergeCartSchema,
  clearCartSchema,
} from "./cart.validator.js";
const router = Router();
const controller = new CartController();

// Public routes with optional authentication
router.post(
  "/add",
  optionalAuth,
  validate({ body: AddToCartSchema }),
  controller.addToCart
);

router.get(
  "/",
  optionalAuth,
  validate({ query: getUserCartsSchema }),
  controller.getUserCartItems
);

router.patch(
  "/:id/quantity",
  optionalAuth,
  validate({
    params: updateCartItemParamSchema,
    body: updateCartItemBodySchema,
  }),
  controller.updateCartItemQuantity
);

router.delete(
  "/:id/remove",
  optionalAuth,
  validate({ params: updateCartItemParamSchema }),
  controller.removeCartItem
);

// Clear cart - body is optional (only needed for guests)
router.delete("/clear", optionalAuth, controller.clearUserCart);

// Protected routes (require authentication)
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

export default router;
