import express from "express";

import errorHandler from "./common/middleware/error.middleware.js";
import routes from "./routes/index.js";
import webhookRoutes from "./webhook/webhook.route.js";
import { RequestInterceptor } from "./common/interceptors/request.interceptor.js";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor.js";
import { notFoundHandler } from "./common/middleware/not-found.middleware.js";
import morgan from "morgan";
import { morganFormat } from "./common/utilities/morganFormatter.js";
import logger from "./common/utilities/logger/index.js";
import prisma from "../db/prisma.js";

const app = express();
app.use("/webhook", webhookRoutes);

app.use(express.json({ strict: true, limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
const requestInterceptor = new RequestInterceptor();
const responseInterceptor = new ResponseInterceptor();

app.use(requestInterceptor.middleware);
app.use(responseInterceptor.middleware);

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

// Health check endpoint for Fly.io
app.get("/health", async (req, res) => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
