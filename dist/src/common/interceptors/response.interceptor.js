"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseInterceptor = void 0;
class ResponseInterceptor {
    handle(req, res, next) {
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            if (res.statusCode >= 400 || (data === null || data === void 0 ? void 0 : data.success) === false) {
                return originalJson(data);
            }
            const { statusCode = 200, message = 'Request successful' } = res.locals.responseMeta || {};
            res.status(statusCode);
            return originalJson({
                success: true,
                message,
                data,
            });
        };
        next();
    }
    get middleware() {
        return this.handle.bind(this);
    }
}
exports.ResponseInterceptor = ResponseInterceptor;
