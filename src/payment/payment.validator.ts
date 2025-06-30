import { z } from "zod";

const AppointmentPaymentSchema = z.object({
  appointmentId: z.string().uuid(),
});

const CheckOutOrderPaymentSchema = z.object({
  orderId: z.string().uuid(),
});

export { AppointmentPaymentSchema, CheckOutOrderPaymentSchema };
