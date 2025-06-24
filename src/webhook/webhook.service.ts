import Stripe from "stripe";
import prisma from "../../db/prisma";
import { AppointmentStatus, PaymentStatus } from "../../generated/prisma";
import logger from "../common/utilities/logger";
import { EmailService } from "../common/mailer";

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
    paymentIntent: Stripe.PaymentIntent,
    emailService: EmailService
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

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId, userId },
      data: {
        status: AppointmentStatus.PAID,
      },
      include: {
        user: { select: { fullName: true, email: true } },
        specialist: { select: { name: true } },
        branch: { select: { name: true, address: true } },
      },
    });

    await prisma.payment.update({
      where: { appointmentId, intentId: paymentIntent.id },
      data: {
        status: PaymentStatus.SUCCESS,
      },
    });

    await emailService.sendEmail({
      to: appointment.user.email,
      subject: `Appointment Confirmed`,
      template: "appointment-confirmation",
      context: {
        userName: appointment.user.fullName,
        appointmentDate: appointment.appointmentDate,
        totalAmount: appointment.totalCost,
        numberOfClients: appointment.numberOfClients,
        specialistName: appointment.specialist.name,
        type: appointment.type,
        location: appointment.branch.address,
        branch: appointment.branch.name,
        currency: appointment.currency,
      },
    });
    await logger.info(
      `Payment succeeded for appointment ${appointmentId} with payment intent ${paymentIntent.id}`
    );
  }

  async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent,
    emailService: EmailService
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

    const payment = await prisma.payment.update({
      where: {
        appointmentId,
        intentId: paymentIntent.id,
        appointment: { userId },
      },
      data: {
        status: PaymentStatus.FAILED,
      },
      select: {
        appointment: {
          include: {
            user: { select: { fullName: true, email: true } },
            specialist: { select: { name: true } },
            branch: { select: { name: true, address: true } },
          },
        },
      },
    });

    await emailService.sendEmail({
      to: payment.appointment.user.email,
      subject: `Payment Processing Failed`,
      template: "payment-failed",
      context: {
        userName: payment.appointment.user.fullName,
        appointmentDate: payment.appointment.appointmentDate,
        totalAmount: payment.appointment.totalCost,
        numberOfClients: payment.appointment.numberOfClients,
        specialistName: payment.appointment.specialist.name,
        type: payment.appointment.type,
        location: payment.appointment.branch.address,
        branch: payment.appointment.branch.name,
        currency: payment.appointment.currency,
      },
    });
    logger.info(
      `Payment failed for appointment ${appointmentId} with payment intent ${paymentIntent.id}`
    );
  }
}
