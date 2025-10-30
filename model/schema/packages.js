const mongoose = require("mongoose");

const Package = new mongoose.Schema({
  title: { type: String },
  days: { type: Number },
  amount: { type: Number },
  description: { type: String },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  createdOn: { type: Date, default: Date.now },
  modifiedOn: { type: Date, default: Date.now },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Package", Package);
