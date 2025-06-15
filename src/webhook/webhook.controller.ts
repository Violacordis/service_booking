// src/controllers/webhook.controller.ts
import { NextFunction, Request, Response } from "express";
import { StripeService } from "../common/stripe/stripe";
import logger from "../common/utilities/logger";
import { WebhookService } from "./webhook.service";

export class WebhookController {
  private stripeService = new StripeService();
  private webhookService = new WebhookService();

  handleStripeWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const sig = req.headers["stripe-signature"] as string;
      const payload = req.body;

      if (!sig) {
        res.status(400).send("Missing Stripe signature");
        return;
      }

      const event = this.stripeService.verifyWebhook(payload, sig);

      switch (event.type) {
        case "payment_intent.created":
          await this.webhookService.handlePaymentIntentInitiate(
            event.data.object as any
          );
          break;
        case "payment_intent.succeeded":
          await this.webhookService.handlePaymentIntentSucceeded(
            event.data.object as any
          );
          break;
        case "payment_intent.payment_failed":
          // Handle failed payment
          break;
        default:
          logger.debug(`Unhandled event type: ${event.type}`);
      }

      res.status(200).send();
    } catch (error) {
      logger.error("Webhook error:", error);
      next(error);
    }
  };
}
