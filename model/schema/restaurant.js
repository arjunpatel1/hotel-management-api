const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  itemImage: {
    type: String,
    default: null,
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

module.exports = mongoose.model("Restaurant", restaurantSchema);
