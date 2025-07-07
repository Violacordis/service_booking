import { PrismaClient } from "../generated/prisma/index.js";
// import { PrismaClient } from "@prisma/client";

import logger from "../src/common/utilities/logger/index.js";

const prismaService = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export async function connectToDatabase() {
  try {
    await prismaService.$connect();
    logger.debug("✅ Connected to database via Prisma");
  } catch (err) {
    logger.error("❌ Failed to connect to database:", err);
    // Don't exit immediately, let the app try to start
    // The health check will fail if the database is not available
  }
}

export default prismaService;
