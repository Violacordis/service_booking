"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShortCode = generateShortCode;
function generateShortCode(prefix = "SRV") {
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
    return `${prefix}-${timestamp}${random}`;
}
