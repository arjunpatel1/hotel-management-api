
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
      type: String // Array of file paths for guest ID proofs
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
  },

  foodItems: [
    new mongoose.Schema(
      {
        // Explicitly define common fields if needed, or leave empty for strict: false
        createdAt: { type: Date, default: Date.now },
        quantity: { type: Number },
        price: { type: Number }
      },
      { strict: false } // Allows other fields (name, image, etc.) to be saved
    )
  ],

  stayExtensionReason: {
    type: String
  },

  extraStayCharge: {
    type: Number
  },

  extraBedsCharge: {
    type: Number
  },

  perBedAmount: {
    type: Number
  },

  addBeds: {
    type: Boolean
  },

  noOfBeds: {
    type: Number
  }
});

module.exports = mongoose.model("Reservation", reservationSchema);

