const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Expenses", expenseSchema);
