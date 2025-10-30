const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  name: String,
  address: String,
  contact: Number,
  mapurl: String,
  googleReviewURL: String,
  websiteURL: String,
  createdDate: {
    type: Date,
    default: Date.now,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  gstNumber: String,
  foodgstpercentage: Number,
  roomgstpercentage: Number,
  checkInTime: String,
  checkOutTime: String,

  checkInButtonStatus: {
    type: Boolean,
    default: true,
  },
  checkOutButtonStatus: {
    type: Boolean,
    default: true,
  },
  mailCheckInButtonStatus: {
    type: Boolean,
    default: true,
  },
  mailCheckOutButtonStatus: {
    type: Boolean,
    default: true,
  },
  mailReservationButtonStatus: {
    type: Boolean,
    default: true,
  },
  hotelImage: {
    type: String,
    default: null,
  },
  status: {
    type: Boolean,
    default: false,
  },
  currencyCode: {
    type: String,
    required: true,
  },
  smtpemail: {
    type: String,
  },
  MailSmtpCode: {
    type: String,
  },
  images: [String],
});

module.exports = mongoose.model("Hotel", hotelSchema);
