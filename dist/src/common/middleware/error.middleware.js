"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_error_1 = require("../errors/app.error");
const logger_1 = __importDefault(require("../utilities/logger"));
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = "Something went wrong";
    if (err instanceof app_error_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
        logger_1.default.error(`[Handled] ${message}`);
    }
    else {
        logger_1.default.error(`[Unhandled] ${err.message}`, err);
    }
    res.status(statusCode).json({
        success: false,
        message,
        data: null,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
exports.default = errorHandler;
