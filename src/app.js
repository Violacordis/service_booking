const express = require("express");
const branchRoute = require("./route/branch.route.js");
const serviceRoute = require("./route/service.route.js");
const specialistRoute = require("./route/specialist.route.js");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/branches", branchRoute);
app.use("/api/v1/services", serviceRoute);
app.use("/api/v1/specialists", specialistRoute);

app.get("/api/v1", async (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Welcome to my service booking API",
  });
});

module.exports = app;
