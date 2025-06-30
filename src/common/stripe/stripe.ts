import Stripe from "stripe";
import config from "../config";
import { AppError } from "../errors/app.error";
import { Currency } from "../../../generated/prisma";
import { StripePaymentIntentDTO } from "./stripe.dto";

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: config.stripe.version,
    });
  }

  verifyWebhook(payload: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe.webhookSecret
    );
  }

  async createPaymentIntent({
    userId,
    amount,
    currency,
    appointmentId,
    orderId,
  }: StripePaymentIntentDTO) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // convert to smallest unit
        currency,
        description: appointmentId
          ? `Payment for appointment ${appointmentId} by user ${userId}`
          : `Payment for order ${orderId} by user ${userId}`,
        payment_method_types: ["card"],
        metadata: {
          ...(appointmentId && { appointmentId }),
          ...(orderId && { orderId }),
          userId,
        },
      });

      return paymentIntent.client_secret;
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(
          `Failed to create payment intent: ${error.message}`,
          500
        );
      } else {
        throw new AppError(
          "Failed to create payment intent: Unknown error",
          500
        );
      }
    }
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      return paymentIntent;
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(
          `Failed to retrieve payment intent: ${error.message}`,
          500
        );
      } else {
        throw new AppError(
          "Failed to retrieve payment intent: Unknown error",
          500
        );
      }
    }
  }
}
