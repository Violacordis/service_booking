import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logDir = path.resolve(__dirname, '../../../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

winston.addColors({
  error: 'bold red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan',
});

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, context }) => {
  return `[${timestamp}] ${level} ${context ? `[${context}]` : ''}: ${message}`;
});

export class Logger {
  private logger: winston.Logger;

  constructor(context?: string) {
    this.logger = winston.createLogger({
      levels,
      level: 'debug',
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
      transports: [
        new winston.transports.Console({
          format: combine(colorize(), logFormat),
        }),
        new winston.transports.File({
          filename: path.join(logDir, 'app.log'),
          level: 'debug',
        }),
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
        }),
      ],
    });

    if (context) {
      this.logger.defaultMeta = { context };
    }
  }

  info(message: string) {
    this.logger.info(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  error(message: string, err?: unknown) {
    if (err instanceof Error) {
      this.logger.error(`${message} - ${err.message}`, { stack: err.stack });
    } else {
      this.logger.error(message);
    }
  }

  http(message: string) {
    this.logger.http(message);
  }
}
