"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logDir = path_1.default.resolve(__dirname, '../../../../logs');
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir);
}
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
winston_1.default.addColors({
    error: 'bold red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'cyan',
});
const { combine, timestamp, printf, colorize, errors } = winston_1.default.format;
const logFormat = printf(({ level, message, timestamp, context }) => {
    return `[${timestamp}] ${level} ${context ? `[${context}]` : ''}: ${message}`;
});
class Logger {
    constructor(context) {
        this.logger = winston_1.default.createLogger({
            levels,
            level: 'debug',
            format: combine(colorize({ all: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), logFormat),
            transports: [
                new winston_1.default.transports.Console({
                    format: combine(colorize(), logFormat),
                }),
                new winston_1.default.transports.File({
                    filename: path_1.default.join(logDir, 'app.log'),
                    level: 'debug',
                }),
                new winston_1.default.transports.File({
                    filename: path_1.default.join(logDir, 'error.log'),
                    level: 'error',
                }),
            ],
        });
        if (context) {
            this.logger.defaultMeta = { context };
        }
    }
    info(message) {
        this.logger.info(message);
    }
    debug(message) {
        this.logger.debug(message);
    }
    warn(message) {
        this.logger.warn(message);
    }
    error(message, err) {
        if (err instanceof Error) {
            this.logger.error(`${message} - ${err.message}`, { stack: err.stack });
        }
        else {
            this.logger.error(message);
        }
    }
    http(message) {
        this.logger.http(message);
    }
}
exports.Logger = Logger;
