const JWT = require("jsonwebtoken");
const {
  agentAuthSchema,
  verifyCodeSchema,
  emailSchema,
  businessSchema,
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

const validateCreateBusiness = (req, res, next) => {
  const { error } = businessSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

// verify access token given to agent during login session
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ msg: "Invalid Token, Please Login" });
    res.agent = { email: decoded.email, id: decoded.agentId };
    next();
  });
};
module.exports = {
  validateAuth,
  validateCode,
  validateEmail,
  validateCreateBusiness,
  verifyJWT,
};
