require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.get("", (req, res) => {
//   res.status(200).send("Hello there");
// });

app.use("/api/agents", require("./agentApp/src/routes/auth"));
app.use("/api/agents/verify", require("./agentApp/src/routes/verify"));
app.use("/api/agents/business", require("./agentApp/src/routes/business"));
app.listen(process.env.PORT || 5000, () => {
  console.log("listening on port 5000");
});
