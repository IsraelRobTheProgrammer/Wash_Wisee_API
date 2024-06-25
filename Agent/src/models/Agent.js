const { default: mongoose } = require("mongoose");
const JWT = require("jsonwebtoken");
const schema = mongoose.Schema;

const AgentSchema = new schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String, select: false },
    verification_code: { type: Number, select: false },
    refresh_token: { type: [String], select: false },
  },
  { timestamps: true }
);

AgentSchema.methods.createAccessToken = function () {
  return JWT.sign(
    { userId: this._id, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "3h",
    }
  );
};

AgentSchema.methods.createRefreshToken = function () {
  return JWT.sign(
    { userId: this.id, email: this.email },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "30d",
    }
  );
};
module.exports = mongoose.model("Agent", AgentSchema);
