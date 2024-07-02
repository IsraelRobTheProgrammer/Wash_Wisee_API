require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const dbConnection = require("./src/utils/dbConnect");

const app = express();
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
app.use("/api/agents/verify", require("./src/routes/verify"));
app.listen(process.env.PORT || 5000, () => {
  console.log("listening on port 5000");
});
