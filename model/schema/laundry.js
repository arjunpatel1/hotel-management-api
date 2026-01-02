const mongoose = require("mongoose");

/* ------------------ ITEM SCHEMA ------------------ */
const laundryItemSchema = new mongoose.Schema({
  laundryItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LaundryItem"
  },
  itemName: String,
  pricingType: String,
  price: Number,
  quantity: Number,
  totalAmount: Number
});

/* ------------------ MAIN SCHEMA ------------------ */
const laundrySchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LaundryServiceProvider",
    required: true
  },

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true
  },

  roomNumber: String,
  items: [laundryItemSchema],

  invoiceNo: String,
  paymentMethod: { type: String, default: "cash" },

  subTotal: Number,
  advanceAmount: Number,
  discount: Number,
  gstAmount: Number,
  grandTotal: Number,
  totalPaid: Number,
  balanceAmount: Number,

  createdDate: { type: Date, default: Date.now },
  dueDate: Date,
  status: { type: String, default: "Pending" }
});

module.exports = mongoose.model("Laundry", laundrySchema, "laundries");
