import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware";
import { AppointmentController } from "./appointment.controller";
import {
  getUserAppointmentsQuerySchema,
  getUserAppointmentsQuerySchemaWithUserId,
  personalBookingSchema,
} from "./appointment.validator";

const router = Router();
const controller = new AppointmentController();
router.post(
  "/book-personal",
  validate(personalBookingSchema),
  controller.bookPersonalAppointment
);
router.get(
  "/",
  validate(getUserAppointmentsQuerySchema, "query"),
  controller.getAppointments
);
router.get(
  "/:id",
  validate(getUserAppointmentsQuerySchemaWithUserId, "params"),
  controller.getUserAppointmentById
);

export default router;
