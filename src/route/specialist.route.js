const express = require("express");
const router = express.Router();
const { addSpecialist } = require("../service/specialist.js");
const validate = require("../middleware/validate.js");
const {
  createSpecialistSchema,
} = require("../validator/specialist.validator.js");

router.route("/").post(validate(createSpecialistSchema), addSpecialist);

module.exports = router;
