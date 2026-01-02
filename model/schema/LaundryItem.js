const mongoose = require("mongoose");

const laundryOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  laundryType: {
    type: String,
    enum: ["Wash", "Iron", "Wash & Iron"],
    required: true
  },
  price: { type: Number, required: true },
  isPrimary: { type: Boolean, default: false }
});

const laundryItemSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  items: [laundryOptionSchema],
  status: {
    type: String,
    enum: ["Active", "Pending", "In-Active"],
    default: "Pending"
  },
  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("LaundryItem", laundryItemSchema);
