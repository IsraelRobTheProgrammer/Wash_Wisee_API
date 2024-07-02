const { default: mongoose } = require("mongoose");
const JWT = require("jsonwebtoken");
const schema = mongoose.Schema;

const AgentSchema = new schema(
  {
    FirstName: { type: String },
    LastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: [true, "Password Is Required!!!"],
      minlength: [6, "Password must be at least 6 characters long."],
      select: false,
    },

    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String, select: false },
    verification_code: { type: String, select: false },
    refresh_token: { type: [String], select: false },

    business_name: { type: String },
    services: {
      type: String,
      enum: {
        values: [
          "Basic Laundry Service (washing, drying and folding clothes)",
          "Premium Laundry Service (washing,drying,folding and ironing)",
          "Dry cleaning Special fabrics Bedding and Linens",
        ],
        message:
          "{VALUE} is not a valid service. Please choose from Clothing, Iron, Biology, Chemistry, Zoology, or Fishery.",
      },
    },
    prices: {
      type: Number,
      enum: [1, 2, 3, 3],
    },
    description: {
      type: String,
      minLength: [50, "Description must be at least 50 characters"],
      maxLength: [250, "Description must be at most 250 characters"],
    },
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
