const mongoose = require("mongoose");

const roomTypeSchema = new mongoose.Schema({
    roomType: {
        type: String,
        required: true
    },

    status: {
        type: String,
        required: true,
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

const RoomType = mongoose.model("roomtype", roomTypeSchema);

module.exports = RoomType;



