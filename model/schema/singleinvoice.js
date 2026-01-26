const mongoose = require("mongoose");

const SingleInvoiceSchema = new mongoose.Schema(
  {
    /* ================= CUSTOMER ================= */
    name: {
      type: String,
      required: [true, "Customer name is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    customerPhoneNumber: {
      type: String,
    },

    /* ================= ROOM ================= */
    roomRent: {
      type: Number,
      min: 0,
      default: 0,
    },
    roomDiscount: {
      type: Number,
      min: 0,
      default: 0,
    },
    haveRoomGst: {
      type: Boolean,
      default: false,
    },
    roomGstPercentage: {
      type: Number,
      min: 0,
      default: 0,
    },
    roomGstAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalRoomAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    /* ================= FOOD ================= */
    foodAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    foodDiscount: {
      type: Number,
      min: 0,
      default: 0,
    },
    haveFoodGst: {
      type: Boolean,
      default: false,
    },
    foodGstPercentage: {
      type: Number,
      min: 0,
      default: 0,
    },
    foodGstAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalFoodAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    /* ================= LAUNDRY ================= */
    laundryAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    laundryDiscount: {
      type: Number,
      min: 0,
      default: 0,
    },
    haveLaundryGst: {
      type: Boolean,
      default: false,
    },
    laundryGstPercentage: {
      type: Number,
      min: 0,
      default: 0,
    },
    laundryGstAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalLaundryAmount: {
      type: Number,
      min: 0,
      default: 0,
    },


    /* ================= TOTALS ================= */
    advanceAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    pendingAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalFoodAndRoomAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    /* ================= META ================= */
    type: {
      type: String,
      default: "single",
    },

    /* ================= TOTAL ================= */
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },


    /* ================= PAYMENT ================= */
    paymentMethod: {
      type: String,
      required: true,
    },

    /* ================= GST ================= */
    gstNumber: {
      type: String,
    },

    /* ================= TIMING ================= */
    finalCheckInTime: String,
    finalCheckOutTime: String,

    /* ================= FOOD ITEMS ================= */
    foodItems: [
      new mongoose.Schema(
        {
          createdAt: { type: Date, default: Date.now },
          quantity: Number,
          price: Number,
        },
        { strict: false }
      ),
    ],

    /* ================= RELATIONS ================= */
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SingleInvoice", SingleInvoiceSchema);
