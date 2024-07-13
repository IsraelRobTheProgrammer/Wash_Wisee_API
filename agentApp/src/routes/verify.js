const express = require("express");
const {
  verificationMail,
  verifyCode,
} = require("../controllers/verifyController");
const { validateCode } = require("../middlewares/auth");

const router = express.Router();

router.get("/:email", verificationMail);
router.post("/code", validateCode, verifyCode);

module.exports = router;
