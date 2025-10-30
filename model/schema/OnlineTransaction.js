// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  payerName: String,
  payerEmail: String,
  amount: String,
  status: String,
  paymentMethod: String,
  reservationDetails: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
