import Redis from "ioredis";
import config from "../config/index.js";
import logger from "../utilities/logger/index.js";

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
});

redis.on("connect", () => logger.debug("✅ Connected to Redis"));
redis.on("error", (err) => logger.error("❌ Redis error:", err));

export default redis;
