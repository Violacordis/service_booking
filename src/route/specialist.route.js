const express = require("express");
const router = express.Router();
const {
  addSpecialist,
  getSpecialists,
} = require("../controller/specialist.controller.js");
const validate = require("../middleware/validate.js");
const {
  createSpecialistSchema,
  getSpecialistsQuerySchema,
} = require("../validator/specialist.validator.js");

router
  .route("/")
  .post(validate(createSpecialistSchema), addSpecialist)
  .get(validate(getSpecialistsQuerySchema), getSpecialists);

module.exports = router;
