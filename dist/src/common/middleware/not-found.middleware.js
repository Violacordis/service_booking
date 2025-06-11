"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const app_error_1 = require("../errors/app.error");
const notFoundHandler = (req, res, next) => {
    next(new app_error_1.AppError('Route not found', 404));
};
exports.notFoundHandler = notFoundHandler;
