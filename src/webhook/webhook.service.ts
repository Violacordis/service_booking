import Stripe from "stripe";
import prisma from "../../db/prisma";
import {
  AppointmentStatus,
  OrderStatus,
  PaymentStatus,
} from "../../generated/prisma";
import logger from "../common/utilities/logger";
import { EmailService } from "../common/mailer";

export class WebhookService {
  async handlePaymentIntentInitiate(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    logger.info(`Handling payment intent initiated for ${paymentIntent.id}`);

    if (!paymentIntent.metadata) {
      logger.warn(
        `Payment intent ${paymentIntent.id} does not have required metadata`
      );
      return;
    }
    const appointmentId = paymentIntent.metadata?.appointmentId;
    const orderId = paymentIntent.metadata?.orderId;
    const userId = paymentIntent.metadata.userId;
    const amount = paymentIntent.amount / 100; // Convert to original amount
    const currency = paymentIntent.currency;

    if (appointmentId) {
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

    if (orderId) {
      const payment = await prisma.payment.findFirst({
        where: {
          orderId,
          status: PaymentStatus.SUCCESS,
          order: { userId },
        },
      });

      if (payment) {
        logger.warn(
          `Payment has already been made for order ${orderId} with status ${payment.status}`
        );
        return;
      }

      await prisma.payment.create({
        data: {
          order: { connect: { id: orderId } },
          intentId: paymentIntent.id,
          amount,
          currency,
        },
      });

      logger.info(
        `Payment initiated for order ${orderId} with amount ${amount} ${currency}`
      );
    }
  }

  async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
    emailService: EmailService
  ): Promise<void> {
    logger.info(`Handling payment intent succeeded for ${paymentIntent.id}`);
    if (!paymentIntent.metadata) {
      logger.warn(
        `Payment intent ${paymentIntent.id} does not have required metadata`
      );
      return;
    }
    const appointmentId = paymentIntent.metadata?.appointmentId;
    const orderId = paymentIntent.metadata?.orderId;
    const userId = paymentIntent.metadata.userId;

    if (appointmentId) {
      await this.appointmentPaymentSucceeded(
        appointmentId,
        paymentIntent,
        userId,
        emailService
      );
    }

    if (orderId) {
      await this.handleOrderPaymentSucceeded(
        orderId,
        paymentIntent,
        userId,
        emailService
      );
    }
  }

  async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent,
    emailService: EmailService
  ): Promise<void> {
    logger.info(`Handling payment intent failed for ${paymentIntent.id}`);
    if (!paymentIntent.metadata) {
      logger.warn(
        `Payment intent ${paymentIntent.id} does not have required metadata`
      );
      return;
    }
    const appointmentId = paymentIntent.metadata?.appointmentId;
    const orderId = paymentIntent.metadata?.orderId;
    const userId = paymentIntent.metadata.userId;

    if (appointmentId) {
      await this.appointmentPaymentFailed(
        appointmentId,
        paymentIntent,
        userId,
        emailService
      );
    }

    if (orderId) {
      await this.orderPaymentFailed(
        orderId,
        paymentIntent,
        userId,
        emailService
      );
    }
  }

  async appointmentPaymentSucceeded(
    appointmentId: string,
    paymentIntent: Stripe.PaymentIntent,
    userId: string,
    emailService: EmailService
  ): Promise<void> {
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

  async handleOrderPaymentSucceeded(
    orderId: string,
    paymentIntent: Stripe.PaymentIntent,
    userId: string,
    emailService: EmailService
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId, userId },
        data: {
          status: OrderStatus.COMPLETED,
        },
        include: {
          user: { select: { fullName: true, email: true } },
        },
      });

      await tx.payment.update({
        where: { orderId, intentId: paymentIntent.id },
        data: {
          status: PaymentStatus.SUCCESS,
        },
      });

      await emailService.sendEmail({
        to: order.user.email,
        subject: `Order Confirmed`,
        template: "order-confirmation",
        context: {
          userName: order.user.fullName,
          totalAmount: order.totalAmount,
          currency: order.currency,
          orderId: order.code,
        },
      });

      logger.info(
        `Payment succeeded for order ${orderId} with payment intent ${paymentIntent.id}`
      );
    });
  }

  async appointmentPaymentFailed(
    appointmentId: string,
    paymentIntent: Stripe.PaymentIntent,
    userId: string,
    emailService: EmailService
  ): Promise<void> {
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

    if (!payment || !payment.appointment) {
      logger.warn(
        `No payment found for appointment ${appointmentId} with intent ${paymentIntent.id}`
      );
      return;
    }

    await emailService.sendEmail({
      to: payment.appointment.user.email,
      subject: `Payment Processing Failed`,
      template: "appointment-payment-failed",
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

  async orderPaymentFailed(
    orderId: string,
    paymentIntent: Stripe.PaymentIntent,
    userId: string,
    emailService: EmailService
  ): Promise<void> {
    const payment = await prisma.payment.update({
      where: {
        orderId,
        intentId: paymentIntent.id,
        order: { userId },
      },
      data: {
        status: PaymentStatus.FAILED,
      },
      select: {
        order: {
          include: {
            user: { select: { fullName: true, email: true } },
          },
        },
      },
    });

    if (!payment || !payment.order) {
      logger.warn(
        `No payment found for order ${orderId} with intent ${paymentIntent.id}`
      );
      return;
    }

    await emailService.sendEmail({
      to: payment.order.user.email,
      subject: `Payment Processing Failed`,
      template: "order-payment-failed",
      context: {
        userName: payment.order.user.fullName,
        totalAmount: payment.order.totalAmount,
        currency: payment.order.currency,
        orderId: payment.order.code,
      },
    });
    logger.info(
      `Payment failed for order ${orderId} with payment intent ${paymentIntent.id}`
    );
  }
}
