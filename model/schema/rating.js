const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  rating: {
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

module.exports = mongoose.model("Rating", ratingSchema);
