import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware";
import { AppointmentController } from "./appointment.controller";
import {
  cancelAppointmentBodySchema,
  cancelAppointmentParamSchema,
  getUserAppointmentsQuerySchema,
  getUserAppointmentsParamSchemaWithUserId,
  personalBookingSchema,
} from "./appointment.validator";

const router = Router();
const controller = new AppointmentController();
router.post(
  "/book-personal",
  validate({ body: personalBookingSchema }),
  controller.bookPersonalAppointment
);
router.get(
  "/",
  validate({ query: getUserAppointmentsQuerySchema }),
  controller.getAppointments
);
router.get(
  "/:id",
  validate({ params: getUserAppointmentsParamSchemaWithUserId }),
  controller.getUserAppointmentById
);
router.patch(
  "/:id/cancel",
  validate({
    params: cancelAppointmentParamSchema,
    body: cancelAppointmentBodySchema.optional(),
  }),
  controller.cancelAppointment
);

export default router;
