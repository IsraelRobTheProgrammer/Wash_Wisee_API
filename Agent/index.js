require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
const dbConnection = require("./src/utils/dbConnect");

// Connect to the local MongoDB instance
dbConnection();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("", (req, res) => {
  res.status(200).send("Hello there");
});

app.use("/api/agents", require("./src/routes/auth"));
app.listen(5000, () => {
  console.log("listening on port 5000");
});
