const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
  {
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: true
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true
    },

    name: String,
    address: String,
    customerPhoneNumber: String,

    type: {
      type: String,
      enum: ["room", "food", "laundry", "single"]
    },
    roomRent: Number,
    foodAmount: Number,
    laundryAmount: Number,

    laundryInvoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SeparateLaundryInvoice"
    },


    extraBedsCharge: Number,
    extraStayCharge: Number,

    discount: Number,
    gstPercentage: Number,
    gstAmount: Number,
    gstNumber: String,
    haveGST: Boolean,

    advanceAmount: Number,
    pendingAmount: Number,
    totalAmount: Number,

    paymentMethod: String,
    invoiceNumber: String,
    createdDate: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", InvoiceSchema);

