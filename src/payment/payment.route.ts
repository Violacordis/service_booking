import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware.js";
import { PaymentController } from "./payment.controller.js";
import {
  AppointmentPaymentSchema,
  CheckOutOrderPaymentSchema,
} from "./payment.validator.js";

const router = Router();
const controller = new PaymentController();
router.post(
  "/appointment",
  validate({ body: AppointmentPaymentSchema }),
  controller.payForAppointment
);
router.post(
  "/order",
  validate({ body: CheckOutOrderPaymentSchema }),
  controller.payForCartOrder
);

export default router;
