const mongoose = require("mongoose");

const laundryInvoiceSchema = new mongoose.Schema(
  {
    laundryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Laundry",
      required: true
    },

    invoiceNo: {
      type: String,
      required: true
    },

    subTotal: Number,
    gstAmount: Number,
    discount: Number,
    advanceAmount: Number,

    grandTotal: Number,
    totalPaid: Number,
    balanceAmount: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "LaundryInvoice",
  laundryInvoiceSchema,
  "laundryinvoices"
);
