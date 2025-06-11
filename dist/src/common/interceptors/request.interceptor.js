"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestInterceptor = void 0;
const logger_1 = __importDefault(require("../utilities/logger"));
class RequestInterceptor {
    handle(req, res, next) {
        const { headers, body, query } = req;
        const mHeaders = { ...headers };
        const mBody = { ...body };
        delete mHeaders.authorization;
        delete mBody.password;
        delete mBody.newPassword;
        logger_1.default.info("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
        logger_1.default.info(`headers --> ${JSON.stringify(mHeaders, null, 2)}`);
        if (Object.keys(mBody).length > 0) {
            logger_1.default.info(`body --> ${mBody}`);
        }
        if (Object.keys(query).length > 0) {
            logger_1.default.info(`query --> ${JSON.stringify(query, null, 2)}`);
        }
        next();
    }
    get middleware() {
        return this.handle.bind(this);
    }
}
exports.RequestInterceptor = RequestInterceptor;
