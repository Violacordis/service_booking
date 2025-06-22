// src/payment/payment.service.ts
import Stripe from "stripe";
import prisma from "../../db/prisma";
import { AppointmentStatus, PaymentStatus } from "../../generated/prisma";
import logger from "../common/utilities/logger";

export class WebhookService {
  async handlePaymentIntentInitiate(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    logger.info(`Handling payment intent initiated for ${paymentIntent.id}`);

    if (!paymentIntent.metadata || !paymentIntent.metadata.appointmentId) {
      logger.warn(
        `Payment intent ${paymentIntent.id} does not have required metadata`
      );
      return;
    }
    const appointmentId = paymentIntent.metadata.appointmentId;
    const userId = paymentIntent.metadata.userId;
    const amount = paymentIntent.amount / 100; // Convert to original amount
    const currency = paymentIntent.currency;

    const payment = await prisma.payment.findFirst({
      where: {
        appointmentId,
        appointment: { userId },
      },
    });

    if (payment) {
      logger.warn(
        `Payment already exists for appointment ${appointmentId} with status ${payment.status}`
      );
      return;
    }

    await prisma.payment.create({
      data: {
        appointment: { connect: { id: appointmentId } },
        intentId: paymentIntent.id,
        amount,
        currency,
      },
    });

    logger.info(
      `Payment initiated for appointment ${appointmentId} with amount ${amount} ${currency}`
    );
  }

  async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    logger.info(`Handling payment intent succeeded for ${paymentIntent.id}`);
    if (!paymentIntent.metadata || !paymentIntent.metadata.appointmentId) {
      logger.warn(
        `Payment intent ${paymentIntent.id} does not have required metadata`
      );
      return;
    }
    const appointmentId = paymentIntent.metadata.appointmentId;
    const userId = paymentIntent.metadata.userId;

    await prisma.appointment.update({
      where: { id: appointmentId, userId },
      data: {
        status: AppointmentStatus.PAID,
      },
    });

    await prisma.payment.update({
      where: { appointmentId, intentId: paymentIntent.id },
      data: {
        status: PaymentStatus.SUCCESS,
      },
    });

    //TODO: Send confirmation email to user

    logger.info(
      `Payment succeeded for appointment ${appointmentId} with payment intent ${paymentIntent.id}`
    );
  }

  async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    logger.info(`Handling payment intent failed for ${paymentIntent.id}`);
    if (!paymentIntent.metadata || !paymentIntent.metadata.appointmentId) {
      logger.warn(
        `Payment intent ${paymentIntent.id} does not have required metadata`
      );
      return;
    }
    const appointmentId = paymentIntent.metadata.appointmentId;
    const userId = paymentIntent.metadata.userId;

    await prisma.payment.update({
      where: { appointmentId, intentId: paymentIntent.id },
      data: {
        status: PaymentStatus.FAILED,
      },
    });

    //TODO: Send failure notification to user

    logger.info(
      `Payment failed for appointment ${appointmentId} with payment intent ${paymentIntent.id}`
    );
  }
}
