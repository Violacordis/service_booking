import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware";
import { PaymentController } from "./payment.controller";
import { AppointmentPaymentSchema } from "./payment.validator";

const router = Router();
const controller = new PaymentController();
router.post(
  "/",
  validate(AppointmentPaymentSchema),
  controller.payForAppointment
);

export default router;
