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
bookingTypeSchema.index(
    { name: 1, hotelId: 1 },
    { unique: true }
);

bookingTypeSchema.index(
  { name: 1, hotelId: 1 },
  { unique: true }
);

const BookingType = mongoose.model("BookingTypes", bookingTypeSchema);

module.exports = BookingType;
