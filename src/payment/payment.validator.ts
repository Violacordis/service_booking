import { z } from "zod";

const AppointmentPaymentSchema = z.object({
  appointmentId: z.string().uuid(),
});

export { AppointmentPaymentSchema };
