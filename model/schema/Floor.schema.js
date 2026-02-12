const mongoose = require("mongoose");

const FloorSchema = new mongoose.Schema({
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

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  createdDate: {
    type: Date,
    default: Date.now
  }
});
FloorSchema.index(
  { name: 1, hotelId: 1 },
  { unique: true }
);

FloorSchema.index(
  { name: 1, hotelId: 1 },
  { unique: true }
);


module.exports = mongoose.model("Floors", FloorSchema);
