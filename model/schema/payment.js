const mongoose = require("mongoose");

const Payment = new mongoose.Schema({
  subscription_id: { type: String },
  title: { type: String },
  days: { type: Number },
  amount: { type: Number },
  description: { type: String },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    // ref: "User",
    // required: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    default: "active",
  },
  createdOn: { type: Date, default: Date.now },
  modifiedOn: { type: Date, default: Date.now },
  endDate: { type: Date },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  type : {
    type :  String , 
    default : "buy"
  }
});
module.exports = mongoose.model("Payment", Payment);
