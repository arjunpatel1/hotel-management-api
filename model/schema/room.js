const mongoose = require("mongoose");

const PricingSchema = new mongoose.Schema({
  roomType: String,
  bookingType: String,
  price: Number,
  isPrimary: Boolean
}, { _id: false });

const RoomSchema = new mongoose.Schema({
  roomNo: { type: String, required: true },
  room_slug: String,

  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  // OLD FIELDS (KEEP for compatibility)
  roomType: String,
  bookingType: String,
  amount: Number,

  // NEW FIELD
  pricingOptions: [PricingSchema],

  floor: { type: String, required: true },
  description: String,
  amenities: [String],

  image: { type: String, default: null },

  capacity: Number,
  childrenCapacity: Number,

  status: {
    type: String,
    enum: ["Available", "Booked", "Cleaning"],
    default: "Available",
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Rooms", RoomSchema);
