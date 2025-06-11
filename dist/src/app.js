"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const error_middleware_1 = __importDefault(require("./common/middleware/error.middleware"));
const routes_1 = __importDefault(require("./routes"));
const request_interceptor_1 = require("./common/interceptors/request.interceptor");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const not_found_middleware_1 = require("./common/middleware/not-found.middleware");
const morgan_1 = __importDefault(require("morgan"));
const morganFormatter_1 = require("./common/utilities/morganFormatter");
const logger_1 = __importDefault(require("./common/utilities/logger"));
const app = (0, express_1.default)();
app.use(express_1.default.json({ strict: true, limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
const requestInterceptor = new request_interceptor_1.RequestInterceptor();
const responseInterceptor = new response_interceptor_1.ResponseInterceptor();
app.use(requestInterceptor.middleware);
app.use(responseInterceptor.middleware);
app.use((0, morgan_1.default)(morganFormatter_1.morganFormat, {
    stream: {
        write: (message) => logger_1.default.http(message.trim()),
    },
}));
app.use("/api/v1", routes_1.default);
app.use(not_found_middleware_1.notFoundHandler);
app.use(error_middleware_1.default);
exports.default = app;
