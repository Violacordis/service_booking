"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganFormat = void 0;
const chalk_1 = __importDefault(require("chalk"));
const colorStatus = (status) => {
    if (status >= 500)
        return chalk_1.default.red(status);
    if (status >= 400)
        return chalk_1.default.yellow(status);
    if (status >= 300)
        return chalk_1.default.cyan(status);
    if (status >= 200)
        return chalk_1.default.green(status);
    return chalk_1.default.white(status);
};
const morganFormat = (tokens, req, res) => {
    const status = res.statusCode;
    const coloredStatus = colorStatus(status);
    return [
        chalk_1.default.magenta(tokens.method(req, res)),
        chalk_1.default.white(tokens.url(req, res)),
        coloredStatus,
        chalk_1.default.gray(`${tokens['response-time'](req, res)} ms`),
    ].join(' ');
};
exports.morganFormat = morganFormat;
