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
roomTypeSchema.index(
    { roomType: 1, hotelId: 1 },
    { unique: true }
);

const RoomType = mongoose.model("roomtype", roomTypeSchema);

module.exports = RoomType;



