const mongoose = require('mongoose');

const OnlineReservationSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true
    },

    roomNo: String,
    roomType: String,
    bookingType: String,
    floor: String,
    adults: Number,
    kids: Number,
    totalPayment: Number,
    advanceAmount: Number,

    customer: {
      name: String,
      phone: String,
      email: String,
      specialRequests: String
    },

    checkInDate: Date,
    checkOutDate: Date,

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'Pending', 'Complete', 'Canceled'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  'OnlineReservation',
  OnlineReservationSchema
);
