const mongoose = require("mongoose");

const bookingTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    status: {
        type: String,
        enum: ["Pending", "Active", "In-Active"],
        default: "Pending",
        required: true
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

const BookingType = mongoose.model("BookingTypes", bookingTypeSchema);

module.exports = BookingType;
