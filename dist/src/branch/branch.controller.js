"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchController = void 0;
const branch_service_1 = require("./branch.service");
class BranchController {
    constructor() {
        this.branchService = new branch_service_1.BranchService();
        this.createBranches = async (req, res) => {
            const data = await this.branchService.createBranches(req.body.branches);
            res.json(data);
        };
        this.fetchBranches = async (req, res) => {
            const data = await this.branchService.getBranches({
                query: req.validated,
            });
            res.json(data);
        };
    }
}
exports.BranchController = BranchController;
