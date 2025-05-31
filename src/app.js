const express = require("express");
const prisma = require("../db/prisma.js"); // Adjust the path as necessary
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/api/v1", async (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Welcome to my service booking API",
  });
});

module.exports = app;
