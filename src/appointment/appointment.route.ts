import { Router } from "express";
import { validate } from "../common/middleware/validate.middleware.js";
import { AppointmentController } from "./appointment.controller.js";
import {
  cancelAppointmentBodySchema,
  cancelAppointmentParamSchema,
  getUserAppointmentsQuerySchema,
  getUserAppointmentsParamSchemaWithUserId,
  bookAppointmentSchema,
} from "./appointment.validator.js";

const router = Router();
const controller = new AppointmentController();
router.post(
  "/book-personal",
  validate({ body: bookAppointmentSchema }),
  controller.bookPersonalAppointment
);

router.post(
  "/book-group",
  validate({ body: bookAppointmentSchema }),
  controller.bookGroupAppointment
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
