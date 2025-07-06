import express from "express";
import { WebhookController } from "./webhook.controller.js";

const router = express.Router();
const controller = new WebhookController();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  controller.handleStripeWebhook
);

export default router;
