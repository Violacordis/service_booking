import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware.js";
import { authenticate } from "../common/middleware/authenticate.middleware.js";
import { OrderController } from "./order.controller.js";
import {
  cancelOrderBodySchema,
  cancelOrderParamSchema,
  getUserOrderParamSchemaWithUserId,
  getUserOrdersSchema,
} from "./order.validator.js";

const router = Router();
const controller = new OrderController();

router.get(
  "/",
  authenticate,
  validate({ query: getUserOrdersSchema }),
  controller.getUserOrders
);
router.get(
  "/:id",
  validate({ params: getUserOrderParamSchemaWithUserId }),
  controller.getUserOrderId
);

router.get(
  "/item/:id",
  validate({ params: getUserOrderParamSchemaWithUserId }),
  controller.getUserOrderItemId
);

router.patch(
  "/:id/cancel",
  validate({
    params: cancelOrderParamSchema,
    body: cancelOrderBodySchema.optional(),
  }),
  controller.cancelAppointment
);
export default router;
