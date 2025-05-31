const express = require("express");
const router = express.Router();
const { createBranch } = require("../service/branch.js");
const validate = require("../middleware/validate.js");
const { createBranchSchema } = require("../validator/branch.validator.js");

router.route("/").post(validate(createBranchSchema), createBranch);

module.exports = router;
