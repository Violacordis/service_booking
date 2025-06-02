const express = require("express");
const router = express.Router();
const { createServices } = require("../service/service.js");
const validate = require("../middleware/validate.js");
const { createServicesSchema } = require("../validator/service.validator.js");

router.route("/").post(validate(createServicesSchema), createServices);

module.exports = router;
