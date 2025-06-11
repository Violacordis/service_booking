"use strict";
const express = require("express");
const router = express.Router();
const { createServices, getServices, } = require("../controller/service.controller.js");
const validate = require("../middleware/validate.js");
const { createServicesSchema, getServicesQuerySchema, } = require("../validator/service.validator.js");
router
    .route("/")
    .post(validate(createServicesSchema), createServices)
    .get(validate(getServicesQuerySchema), getServices);
module.exports = router;
