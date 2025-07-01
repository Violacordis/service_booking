import { AppError } from "../common/errors/app.error";
import { StripeService } from "../common/stripe/stripe";
import prisma from "../../db/prisma";
import {
  AppointmentStatus,
  Currency,
  OrderStatus,
  PaymentStatus,
} from "../../generated/prisma";
import app from "../app";
import logger from "../common/utilities/logger";

export class PaymentService {
  private stripeService = new StripeService();

  async payForAppointment(appointmentId: string, userId: string) {
    try {
      const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, userId },
      });

      if (!appointment) {
        throw new AppError(
          "Appointment not found or does not belong to user",
          404
        );
      }

      if (appointment.status == AppointmentStatus.PAID) {
        throw new AppError("Appointment has already been paid for", 400);
      }

      if (appointment.totalCost < 900 && appointment.currency == Currency.ngn) {
        throw new AppError(
          "Minimum payment for NGN appointments is 900 (50cents",
          400
        );
      }

      const pendingPayment = await prisma.payment.findFirst({
        where: {
          appointmentId,
          appointment: { userId },
          status: PaymentStatus.PENDING,
          intentId: { not: null },
        },
      });

      let clientSecret;

      if (pendingPayment?.intentId) {
        logger.info(
          `Retrieving existing payment intent for appointment ${appointmentId} and user ${userId}`
        );
        // If a pending payment exists, retrieve the existing payment intent
        const intent = await this.stripeService.retrievePaymentIntent(
          pendingPayment.intentId
        );

        clientSecret = intent.client_secret;
      } else {
        logger.info(
          `Creating new payment intent for appointment ${appointmentId} and user ${userId}`
        );
        // If no pending payment exists, create a new payment intent
        clientSecret = await this.stripeService.createPaymentIntent({
          amount: appointment.totalCost,
          userId,
          currency: appointment.currency,
          appointmentId,
        });
      }

      return {
        message: "Payment intent created successfully",
        clientSecret,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Payment failed: ${error.message}`, 500);
      } else {
        throw new AppError("Payment failed: Unknown error", 500);
      }
    }
  }

  async payForCartOrder(orderId: string, userId: string) {
    try {
      const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
      });

      if (!order) {
        throw new AppError("Order not found or does not belong to user", 404);
      }

      if (order.status == OrderStatus.COMPLETED) {
        throw new AppError(
          "Order has already been paid for and completed",
          400
        );
      }

      const pendingPayment = await prisma.payment.findFirst({
        where: {
          orderId,
          order: { userId },
          status: PaymentStatus.PENDING,
          intentId: { not: null },
        },
      });

      let clientSecret;

      if (pendingPayment?.intentId) {
        logger.info(
          `Retrieving existing payment intent for order ${orderId} and user ${userId}`
        );
        // If a pending payment exists, retrieve the existing payment intent
        const intent = await this.stripeService.retrievePaymentIntent(
          pendingPayment.intentId
        );

        clientSecret = intent.client_secret;
      } else {
        logger.info(
          `Creating new payment intent for order ${orderId} and user ${userId}`
        );
        // If no pending payment exists, create a new payment intent
        clientSecret = await this.stripeService.createPaymentIntent({
          amount: order.totalAmount,
          userId,
          currency: order.currency,
          orderId,
        });
      }

      return {
        message: "Payment intent created successfully",
        clientSecret,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Payment failed: ${error.message}`, 500);
      } else {
        throw new AppError("Payment failed: Unknown error", 500);
      }
    }
  }
}
