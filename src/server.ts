import app from "./app";
import { connectToDatabase } from "../db/prisma";
import logger from "./common/utilities/logger";
import config from "./common/config";

const port = config.app.port;
const nodeEnv = config.app.environment;

async function startServer() {
  await connectToDatabase();
  app.listen(port, () => {
    logger.debug(`🚀 App started in ${nodeEnv} mode on port ${port}`);
  });
}

startServer();
