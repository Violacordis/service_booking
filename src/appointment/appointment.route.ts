import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware";
import { AppointmentController } from "./appointment.controller";
import { personalBookingSchema } from "./appointment.validator";

const router = Router();
const controller = new AppointmentController();
router.post(
  "/book-personal",
  validate(personalBookingSchema),
  controller.bookPersonalAppointment
);

export default router;
