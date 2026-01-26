const mongoose = require("mongoose");
const moment = require("moment");

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

  // 💰 Pricing breakdown
  roomRentPerDay: {
    type: Number
  },

  totalDays: {
    type: Number
    // Auto-calculated by pre-save hook
  },

  roomRent: {
    type: Number // total room rent (perDay × days) - Auto-calculated
    // Auto-calculated by pre-save hook
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
  },

  isPriceLocked: {
    type: Boolean,
    default: false
  },

  taxPercentage: {
    type: Number,
    default: 0
  },

  taxAmount: {
    type: Number,
    default: 0
  },

  grandTotal: {
    type: Number,
    default: 0
  }
});

// 🔥 PRE-SAVE HOOK: Auto-Calculate Totals
reservationSchema.pre("save", function (next) {
  // 🔒 If price is locked, skip all calculations
  if (this.isPriceLocked) {
    return next();
  }

  // 🏨 Room rent calc
  if (this.checkInDate && this.checkOutDate && this.roomRentPerDay) {
    const start = moment(this.checkInDate).startOf("day");
    const end = moment(this.checkOutDate).startOf("day");

    const days = Math.max(end.diff(start, "days"), 1);

    this.totalDays = days;
    this.roomRent = this.roomRentPerDay * days;
  }

  const extraBedsCharge = Number(this.extraBedsCharge || 0);
  const extraStayCharge = Number(this.extraStayCharge || 0);

  // 🧾 Subtotal
  this.totalAmount =
    this.roomRent +
    extraBedsCharge +
    extraStayCharge;

  // 💸 TAX
  const taxPercent = Number(this.taxPercentage || 0);
  this.taxAmount = (this.totalAmount * taxPercent) / 100;

  // 💰 FINAL PAYABLE
  this.grandTotal = this.totalAmount + this.taxAmount;
  this.totalPayment = this.grandTotal;

  next();
});

// 🧾 VIRTUAL: Pricing Breakdown
reservationSchema.virtual("pricingBreakdown").get(function () {
  return {
    perDay: this.roomRentPerDay,
    days: this.totalDays,
    roomTotal: this.roomRent,
    extraBeds: this.extraBedsCharge || 0,
    extraStay: this.extraStayCharge || 0,
    subTotal: this.totalAmount,
    taxPercent: this.taxPercentage,
    taxAmount: this.taxAmount,
    grandTotal: this.grandTotal
  };
});

// Enable virtuals
reservationSchema.set("toJSON", { virtuals: true });
reservationSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Reservation", reservationSchema);
