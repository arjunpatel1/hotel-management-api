const mongoose = require("mongoose");

const kotSchema = new mongoose.Schema({
    hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    },
    staffId: {
    type: mongoose.Schema.Types.ObjectId,
    },
    description: {
        type: String,
        required: true,
    },
    reservationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'reservation',
    },
    roomNumber: {
        type: String,
    },
    status: {
        type: String,
        default: "pending",
    },
    paymentMethod: {
        type: String,
        default: "Cash",
    },
    createdDate: {
    type: Date,
    default: Date.now,
    }
});

module.exports = mongoose.model("kitchenOrderTicket", kotSchema);
