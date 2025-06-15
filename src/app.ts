import express from "express";

import errorHandler from "./common/middleware/error.middleware";
import routes from "./routes";
import webhookRoutes from "./webhook/webhook.route";
import { RequestInterceptor } from "./common/interceptors/request.interceptor";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { notFoundHandler } from "./common/middleware/not-found.middleware";
import morgan from "morgan";
import { morganFormat } from "./common/utilities/morganFormatter";
import logger from "./common/utilities/logger";

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

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
