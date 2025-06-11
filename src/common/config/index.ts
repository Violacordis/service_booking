import dotenv from "dotenv";

dotenv.config();

const env = (key: string, defaultVal: any = undefined) => {
  return process.env[key] || defaultVal;
};

env.require = (key: string, defaultVal: any = undefined) => {
  const value = process.env[key] || defaultVal;
  if (!value) {
    throw new Error(`Environment variable '${key}' is missing!`);
  }

  return value;
};

const config = {
  app: {
    name: "Service Booking System",
    description: "A system for booking services across various branches",
    environment: env("NODE_ENV", "development"),
    port: Number(env("PORT", 2017)),
  },
  api: {
    version: env("APP_VERSION", "api/v1"),
  },
  db: {
    url: env.require("DATABASE_URL"),
  },
  redis: {
    host: env("REDIS_HOST", "localhost"),
    port: Number(env("REDIS_PORT")),
  },
};

export default config;
