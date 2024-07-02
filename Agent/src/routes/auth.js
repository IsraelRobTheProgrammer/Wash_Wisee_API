const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { validateAuth, validateEmail } = require("../middlewares/auth");
const router = express.Router();

router.post("/signup", validateAuth, signup);
router.post("/login", validateAuth, login);
router.post("/forgot-pswd", validateEmail, forgotPassword);
router.post("/reset-pswd", resetPassword);

module.exports = router;
