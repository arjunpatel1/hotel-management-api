const mongoose = require("mongoose");

const reservation = new mongoose.Schema({
  roomNo: String,
  // acNonAc: String,
  totalAmount: Number,
  bookingId: String,
  advanceAmount: Number,
  checkInDate: Date,
  checkOutDate: Date,
  FinalCheckInTime: String,
  FinalCheckOutTime: String,
  hotelId: mongoose.Schema.Types.ObjectId,
  paymentMethod: String,
  finalcheckedin: String,
  foodItems: [],
  customers: [],
  createdDate: {
    type: Date,
  },
  status: {
    type: String,
    default: "pending",
  },
  paymentOption: {
    type: String,
    default: "Cash",
  },
  advancePaymentMethod: {
    type: String,
    default: "Cash",
  },
  addBeds: {
    type: Boolean,
    default: false,
  },
  noOfBeds: {
    type: Number,
    default: 0,
  },
  extraBedsCharge: {
    type: Number,
    default: 0,
  },
  perBedAmount: {
    type: Number,
    default: 0,
  },
  stayExtensionReason: {
    type: String,
  },
  extraStayCharge: {
    type: Number,
  },
});

module.exports = mongoose.model("reservation", reservation);
