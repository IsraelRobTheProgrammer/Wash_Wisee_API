const express = require("express");
const { agentDashBoard } = require("../controllers/agentController");
const { verifyJWT } = require("../middlewares/auth");
const router = express.Router();

router.post("/signup", verifyJWT, agentDashBoard);
// router.post("/login", validateAuth, login);
// router.post("/forgot-pswd", validateEmail, forgotPassword);
// router.post("/reset-pswd", resetPassword);

module.exports = router;
