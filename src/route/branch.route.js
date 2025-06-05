const express = require("express");
const router = express.Router();
const {
  createBranch,
  getBranches,
} = require("../controller/branch.controller.js");
const validate = require("../middleware/validate.js");
const {
  createBranchSchema,
  getBranchesQuerySchema,
} = require("../validator/branch.validator.js");

router
  .route("/")
  .post(validate(createBranchSchema), createBranch)
  .get(validate(getBranchesQuerySchema), getBranches);

module.exports = router;
