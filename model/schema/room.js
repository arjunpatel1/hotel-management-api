const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomNo: String,
  room_slug : String,
  roomType: String,
  amount: Number,
  hotelId: mongoose.Schema.Types.ObjectId,
  bookingStatus: String,
  description: String,
  amenities: [String],
  images: [String],
  capacity:Number,
  childrenCapacity:Number,
  checkIn: {
    type: Date,
  },
  checkOut: {
    type: Date,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  }
});

const Room = mongoose.model("Rooms", RoomSchema);

module.exports = Room;
