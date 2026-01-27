const mongoose = require("mongoose");

const extraBedChargesSchema = new mongoose.Schema({
  roomTypeId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "roomtype", 
  required: true
},


  chargePerDay: {
    type: Number,
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
  "ExtraBedCharges",
  extraBedChargesSchema
);
