const {
  agentAuthSchema,
  verifyCodeSchema,
  emailSchema,
} = require("../../joiSchema");

const validateAuth = (req, res, next) => {
  const { error } = agentAuthSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateCode = (req, res, next) => {
  const { error } = verifyCodeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const validateEmail = (req, res, next) => {
  const { error } = emailSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = { validateAuth, validateCode, validateEmail };
