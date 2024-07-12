const express = require("express");
const { createBusiness } = require("../controllers/businessController");
const { validateCreateBusiness } = require("../middlewares/auth");
const router = express.Router();

router.post("/create", validateCreateBusiness, createBusiness);
// router.post("/login", validateAuth, login);
// router.post("/forgot-pswd", validateEmail, forgotPassword);
// router.post("/reset-pswd", resetPassword);

module.exports = router;
