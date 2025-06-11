"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialistController = void 0;
const specialist_service_1 = require("./specialist.service");
class SpecialistController {
    constructor() {
        this.specialistService = new specialist_service_1.SpecialistService();
        this.addSpecialists = async (req, res) => {
            const data = await this.specialistService.addSpecialists(req.body.specialists);
            res.json(data);
        };
        this.getSpecialists = async (req, res) => {
            const data = await this.specialistService.getSpecialists({
                query: req.validated,
            });
            res.json(data);
        };
    }
}
exports.SpecialistController = SpecialistController;
