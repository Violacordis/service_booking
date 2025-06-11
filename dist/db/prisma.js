"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
const prisma_1 = require("../generated/prisma");
const logger_1 = __importDefault(require("../src/common/utilities/logger"));
const prismaService = new prisma_1.PrismaClient();
async function connectToDatabase() {
    try {
        await prismaService.$connect();
        logger_1.default.debug("✅ Connected to database via Prisma");
    }
    catch (err) {
        logger_1.default.error("❌ Failed to connect to database:", err);
        process.exit(1);
    }
}
exports.default = prismaService;
