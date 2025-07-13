import { Redis } from "@upstash/redis";
import config from "../config/index.js";
import logger from "../utilities/logger/index.js";

const redis = new Redis({
  url: config.redis.restUrl,
  token: config.redis.restToken,
});

(async () => {
  try {
    await redis.set("connection-test", "ok", { ex: 60 });
    logger.debug("✅ Connected to Redis via REST");
  } catch (err) {
    logger.error("❌ Redis connection error:", err);
  }
})();

export default redis;
