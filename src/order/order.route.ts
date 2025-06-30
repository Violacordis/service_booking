import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware";
import { authenticate } from "../common/middleware/authenticate.middleware";
import { OrderController } from "./order.controller";
import { getUserOrdersSchema } from "./order.validator";

const router = Router();
const controller = new OrderController();

router.get(
  "/",
  authenticate,
  validate({ query: getUserOrdersSchema }),
  controller.getUserOrders
);

export default router;
