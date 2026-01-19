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

  roomRent: {
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

  guestIdProofs: [
    {
      type: String 
    }
  ],

  status: {
    type: String,
    default: "pending" 
  },

  paymentOption: {
    type: String 
  },

  createdDate: {
    type: Date,
    default: Date.now
  },

  foodItems: [
    new mongoose.Schema(
      {
        createdAt: { type: Date, default: Date.now },
        quantity: { type: Number },
        price: { type: Number }
      },
      { strict: false } 
    )
  ],

  laundryItems: [
  new mongoose.Schema(
    {
      createdAt: { type: Date, default: Date.now },
      quantity: { type: Number, default: 1 },
      price: { type: Number, default: 0 },
      status: { type: String, default: "pending" } 
    },
    { strict: false }
  )
],


  stayExtensionReason: {
    type: String
  },

  extraStayCharge: {
    type: Number
  },

  perBedAmount: {
    type: Number
  }
});

module.exports = mongoose.model("Reservation", reservationSchema);
