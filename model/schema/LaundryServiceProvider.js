const mongoose = require("mongoose");

const laundryServiceProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  status: {
    type: String,
    enum: ["Pending", "Active", "In-Active"],
    default: "Pending"
  },

  phone: {
  type: String,
  required: true
},


  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  createdDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model(
  "LaundryServiceProvider",
  laundryServiceProviderSchema
);
