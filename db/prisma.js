const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"], // Optional: enable logging
});

module.exports = prisma;
