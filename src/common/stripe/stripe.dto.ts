export interface StripePaymentIntentDTO {
  userId: string;
  amount: number;
  currency: string;
  appointmentId?: string;
  orderId?: string;
}
