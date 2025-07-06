import app from "./app.js";
import { connectToDatabase } from "../db/prisma.js";
import logger from "./common/utilities/logger/index.js";
import config from "./common/config/index.js";

const port = config.app.port;
const nodeEnv = config.app.environment;

async function startServer() {
  await connectToDatabase();
  app.listen(port, () => {
    logger.debug(`🚀 App started in ${nodeEnv} mode on port ${port}`);
  });
}

startServer();
