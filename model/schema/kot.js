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
    createdDate: {
    type: Date,
    default: Date.now,
    }
});

module.exports = mongoose.model("kitchenOrderTicket", kotSchema);
