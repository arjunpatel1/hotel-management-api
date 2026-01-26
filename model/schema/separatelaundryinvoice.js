const mongoose = require("mongoose");

const SeparateLaundryInvoiceSchema = new mongoose.Schema({
  reservationId: mongoose.Schema.Types.ObjectId,
  hotelId: mongoose.Schema.Types.ObjectId,

  name: String,
  address: String,
  customerPhoneNumber: String,

  laundryProviderName: String,
  laundryPhone: String,
  roomNumber: String,

  items: [
    {
      itemName: String,
      price: Number,
      quantity: Number,
      totalAmount: Number
    }
  ],

  discount: Number,
  gstNumber: String,
  gstPercentage: Number,
  gstAmount: Number,
  haveGST: Boolean,

  totalAmount: Number,
  paymentMethod: String,

  invoiceNumber: String
}, { timestamps: true });

module.exports =
  mongoose.models.SeparateLaundryInvoice ||
  mongoose.model("SeparateLaundryInvoice", SeparateLaundryInvoiceSchema);

