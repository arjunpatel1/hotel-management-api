const mongoose = require("mongoose");

// Define the Mongoose schema
const SingleInvoiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Customer name is required"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  roomRent: {
    type: Number,
    min: [0, "Room rent cannot be negative"],
  },
  advanceAmount: {
    type: Number,
    min: [0, "Advance amount cannot be negative"],
  },
  pendingAmount: {
    type: Number,
    min: [0, "Pending amount cannot be negative"],
  },
  roomDiscount: {
    type: Number,
    min: [0, "Discount cannot be negative"],
  },
  paymentMethod: {
    type: String,
    required: [true, "Payment Method is required"],
  },
  haveRoomGst: {
    type: Boolean,
  },
  roomGstAmount: {
    type: Number,
    min: [0, "Gst Amount cannot be negative"],
  },
  roomGstPercentage: {
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

  totalRoomAmount: {
    type: Number,
    required: [true, "Total amount is required"],
    min: [0, "Total amount cannot be negative"],
  },

  //food related fields starts here
  foodAmount: {
    type: Number,
    min: [0, "Food amount cannot be negative"],
  },
  foodDiscount: {
    type: Number,
    min: [0, "Discount cannot be negative"],
  },
  haveFoodGst: {
    type: Boolean,
  },
  foodGstAmount: {
    type: Number,
    min: [0, "Gst Amount cannot be negative"],
  },
  foodGstPercentage: {
    type: Number,
    min: [0, "GST percentage cannot be negative"],
  },

  totalFoodAmount: {
    type: Number,
    required: [true, "Total amount is required"],
    min: [0, "Total amount cannot be negative"],
  },

  totalFoodAndRoomAmount: {
    type: Number,
    required: [true, "Total amount is required"],
    min: [0, "Total amount cannot be negative"],
  },
  finalCheckInTime: {
    type: String,
  },
  finalCheckOutTime: {
    type: String,
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
});

// Compile the schema into a model
const SingleInvoice = mongoose.model("SingleInvoice", SingleInvoiceSchema);

module.exports = SingleInvoice;
