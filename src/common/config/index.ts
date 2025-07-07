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
  jwt: {
    secret: env.require("JWT_SECRET"),
    expiresIn: env("JWT_EXPIRES_IN", "24h"),
  },
  redis: {
    host: env("REDIS_HOST", "localhost"),
    port: Number(env("REDIS_PORT", 6379)),
  },
  stripe: {
    secretKey: env.require("STRIPE_SECRET_KEY"),
    webhookSecret: env.require("STRIPE_WEBHOOK_SECRET"),
    publishableKey: env("STRIPE_PUBLISHABLE_KEY"),
    version: env("STRIPE_API_VERSION", "2025-05-28.basil"),
  },
  email: {
    mailHost: env.require("MAIL_HOST"),
    mailPort: Number(env.require("MAIL_PORT")),
    auth: {
      user: env.require("AUTH_MAIL_USER"),
      pass: env.require("AUTH_MAIL_PASS"),
    },
    mailFrom: env.require("DEFAULT_FROM_EMAIL", "support@nailer.com"),
  },
  cloudinary: {
    cloudName: env.require("CLOUDINARY_CLOUD_NAME"),
    apiKey: env.require("CLOUDINARY_API_KEY"),
    apiSecret: env.require("CLOUDINARY_API_SECRET"),
  },
};

export default config;
