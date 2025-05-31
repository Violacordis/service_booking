const express = require("express");
const branchRoute = require("./route/branch.route.js");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/v1/branches", branchRoute);

app.get("/api/v1", async (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Welcome to my service booking API",
  });
});

module.exports = app;
