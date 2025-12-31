const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  idCardType: {
    type: String,
    required: true,
  },
  idcardNumber: {
    type: String,
    required: false,
  },
  idFile: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: true,
  },
  visitTime: {
    type: String,
    required: true,
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  createdDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  roomNo: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Visitors", VisitorSchema);
