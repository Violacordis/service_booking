import { PrismaClient } from "../generated/prisma";
import logger from "../src/common/utilities/logger";

const prismaService = new PrismaClient();

export async function connectToDatabase() {
  try {
    await prismaService.$connect();
    logger.debug("✅ Connected to database via Prisma");
  } catch (err) {
    logger.error("❌ Failed to connect to database:", err);
    process.exit(1);
  }
}

export default prismaService;
