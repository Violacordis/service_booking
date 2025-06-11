"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("../db/prisma");
const logger_1 = __importDefault(require("./common/utilities/logger"));
const config_1 = __importDefault(require("./common/config"));
const port = config_1.default.app.port;
const nodeEnv = config_1.default.app.environment;
async function startServer() {
    await (0, prisma_1.connectToDatabase)();
    app_1.default.listen(port, () => {
        logger_1.default.debug(`🚀 App started in ${nodeEnv} mode on port ${port}`);
    });
}
startServer();
