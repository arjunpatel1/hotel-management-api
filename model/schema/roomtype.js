const mongoose = require("mongoose");

const roomTypeSchema = new mongoose.Schema({
    roomType: {
        type: String,
        require: true
    },
    category: {
        type: String,
        default: 'nonac',
        enum: ['ac', 'nonac']
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    createdDate: {
        type: Date,
        default: Date.now()
    }
});

const RoomType = mongoose.model("RoomTypes", roomTypeSchema);

module.exports = RoomType;