"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const branch_route_1 = __importDefault(require("../branch/branch.route"));
const service_route_1 = __importDefault(require("../core service/service.route"));
const specialist_route_1 = __importDefault(require("../specialist/specialist.route"));
const router = (0, express_1.Router)();
router.use("/branches", branch_route_1.default);
router.use("/services", service_route_1.default);
router.use("/specialists", specialist_route_1.default);
router.get("/home", (_req, res) => {
    res.json({ status: "OK", message: "Welcome to my service booking API" });
});
exports.default = router;
