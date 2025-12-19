const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  roomNo: String,
  roomType: String,
  bookingType: String,
  floor: String,

  adults: Number,
  kids: Number,

  totalAmount: Number,
  totalPayment: Number,
  advanceAmount: Number,

  checkInDate: Date,
  checkOutDate: Date,

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  customers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer"
    }
  ],

  createdDate: {
    type: Date,
    default: Date.now
  },

  status: {
    type: String,
    default: "pending"
  },

  paymentOption: String
});

module.exports = mongoose.model("Reservation", reservationSchema);
