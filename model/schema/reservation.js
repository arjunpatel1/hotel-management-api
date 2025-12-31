
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  roomNo: {
    type: String
  },

  roomType: {
    type: String
  },

  bookingType: {
    type: String
  },

  floor: {
    type: String
  },

  adults: {
    type: Number
  },

  kids: {
    type: Number
  },

  totalAmount: {
    type: Number
  },

  totalPayment: {
    type: Number
  },

   addBeds: {
    type: Boolean,
    default: false
  },
  noOfBeds: {
    type: Number,
    default: 0
  },
  extraBedsCharge: {
    type: Number,
    default: 0
  },

  advanceAmount: {
    type: Number
  },

  checkInDate: {
    type: Date
  },

  checkOutDate: {
    type: Date
  },

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true
  },

  customers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer"
    }
  ],

  status: {
    type: String,
    default: "pending" // pending | active | checked-out
  },

  paymentOption: {
    type: String // Cash | Card | UPI | Online
  },

  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Reservation", reservationSchema);

