"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreServiceController = void 0;
const service_service_1 = require("./service.service");
class CoreServiceController {
    constructor() {
        this.coreService = new service_service_1.CoreService();
        this.createServices = async (req, res) => {
            const data = await this.coreService.createServices(req.body.services);
            res.json(data);
        };
        this.getServices = async (req, res) => {
            const data = await this.coreService.getServices({
                query: req.validated,
            });
            res.json(data);
        };
    }
}
exports.CoreServiceController = CoreServiceController;
