const { default: mongoose } = require("mongoose");
const JWT = require("jsonwebtoken");
const schema = mongoose.Schema;

const AgentSchema = new schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: [true, "Password Is Required!!!"],
      minlength: [6, "Password must be at least 6 characters long."],
      select: false,
    },

    isVerified: { type: Boolean, default: false },
    resetPasswordCode: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },

    verification_code: { type: String, select: false },
    refreshToken: { type: [String], select: false },

    // business details
    businessName: { type: String },
    services: {
      type: String,
      enum: {
        values: [
          "Basic Laundry Service - washing, drying and folding clothes",
          "Premium Laundry Service - washing, drying, folding and ironing",
          "Dry cleaning - special fabrics",
          "Bedding and Linens",
        ],
        message:
          "{VALUE} is not a valid service. Please choose from Basic Laundry Service - washing, drying and folding clothes, Premium Laundry Service - washing, drying, folding and ironing, Dry cleaning Special fabrics Bedding and Linens.",
      },
    },
    priceRange: {
      type: String,
      enum: [
        "Basic Laundry service - 1000 naira minimum",
        "Premium Laundry service - 2000 naira minimum",
        "Dry cleaning - Negotiable",
        "Bedding and Linens- 500 naira minimum",
      ],
    },
    minimumPrice: { type: Number },
    maximumPrice: { type: Number },
    description: {
      type: String,
      minLength: [50, "Description must be at least 50 characters"],
      maxLength: [250, "Description must be at most 250 characters"],
    },

    totalEarning: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    rejectedBookings: { type: Number, default: 0 },
    pendingBookings: { type: Number, default: 0 },
    recentBookings: [
      {
        customerName: { type: String, required: true },
        amount: { type: Number, required: true },
        serviceType: { type: String, required: true },
        date: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true }
);

AgentSchema.methods.createAccessToken = function () {
  return JWT.sign(
    { agentId: this._id, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "3h",
    }
  );
};

AgentSchema.methods.createRefreshToken = function () {
  return JWT.sign(
    { agentId: this.id, email: this.email },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "30d",
    }
  );
};


module.exports = AgentSchema;
