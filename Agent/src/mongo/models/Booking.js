const { default: mongoose } = require("mongoose");
const { conn } = require("../dbConnect");
// const JWT = require("jsonwebtoken");
const schema = mongoose.Schema;

// Booking Details
const BookingSchema = new schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    agentId: { type: Schema.Types.ObjectId, ref: "Agent", required: true },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "REJECTED", "COMPLETED"],
      default: "PENDING",
    },
    laundryService: { type: String, enum: [], required: true },
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
    bargain: { type: Number },
    pickUpDate: { type: Date },
    deliveryDate: { type: Date },
    paymentMethod: {
      type: String,
      enum: ["ON_DELIVERY", "PAY_BEFORE_DELIVERY"],
    },
    description: {
      type: String,
      minLength: [50, "Description must be at least 50 characters"],
      maxLength: [250, "Description must be at most 250 characters"],
      // required: true,
    },
    pickupLocation: { type: String, required: true },
    deliveryLocation: { type: String, required: true },
    refID: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
