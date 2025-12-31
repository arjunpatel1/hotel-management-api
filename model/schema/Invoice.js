const mongoose = require("mongoose");

// Define the Mongoose schema
const InvoiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Customer name is required"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  type: {
    type: String,
    enum: ["room", "food"],
    required: true,
  },
  roomRent: {
    type: Number,
    required: function () {
      return this.type === "room";
    },
    min: [0, "Room rent cannot be negative"],
  },
  pendingAmount: {
    type: Number,
    required: function () {
      return this.type === "room";
    },
    min: [0, "Pending amount cannot be negative"],
  },
  advanceAmount: {
    type: Number,
    required: function () {
      return this.type === "room";
    },
    min: [0, "Advance amount cannot be negative"],
  },
  foodAmount: {
    type: Number,
    required: function () {
      return this.type !== "room";
    },
    min: [0, "Food amount cannot be negative"],
  },
  discount: {
    type: Number,
    min: [0, "Discount cannot be negative"],
  },
  extraStayCharge: {
    type: Number,
    default: 0,
    min: [0, "Extra stay charge cannot be negative"],
  },
  extraBedsCharge: {
    type: Number,
    default: 0,
    min: [0, "Extra beds charge cannot be negative"],
  },
  gstPercentage: {
    type: Number,
    min: [0, "GST percentage cannot be negative"],
  },
  gstNumber: {
    type: String,
    validate: {
      validator: function (value) {
        if (this.haveGST) {
          const regex =
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Za-z]{1}[Z]{1}[0-9A-Za-z]{1}$/;
          return regex.test(value);
        }
        return true;
      },
      message: "Invalid GST number format",
    },
  },
  haveGST: {
    type: Boolean,
  },
  gstAmount: {
    type: Number,
    min: [0, "Gst Amount cannot be negative"],
  },
  haveRoomGst: {
    type: Boolean,
  },
  roomGstAmount: {
    type: Number,
    min: [0, "Room GST Amount cannot be negative"],
  },
  roomgstpercentage: {
    type: Number,
    min: [0, "Room GST percentage cannot be negative"],
  },
  paymentMethod: {
    type: String,
    required: [true, "Payment Method is required"],
  },
  totalAmount: {
    type: Number,
    required: [true, "Total amount is required"],
    min: [0, "Total amount cannot be negative"],
  },
  reservationId: {
    type: mongoose.Types.ObjectId,
  },
  hotelId: {
    type: mongoose.Types.ObjectId,
  },
  invoiceNumber: {
    type: String,
    unique: true,
  },
  customerPhoneNumber: {
    type: String,
  },
  finalCheckInTime: {
    type: String,
  },
  finalCheckOutTime: {
    type: String,
  },
  foodItems: [
    new mongoose.Schema(
      {
        createdAt: { type: Date, default: Date.now },
        quantity: { type: Number },
        price: { type: Number },
      },
      { strict: false }
    ),
  ],
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);

module.exports = Invoice;
