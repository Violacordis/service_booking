"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const env = (key, defaultVal = undefined) => {
    return process.env[key] || defaultVal;
};
env.require = (key, defaultVal = undefined) => {
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
exports.default = config;
