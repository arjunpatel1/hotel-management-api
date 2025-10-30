const mongoose = require("mongoose");

// Define the Mongoose schema
const FoodInvoiceSchema = new mongoose.Schema({
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
  foodAmount: {
    type: Number,
    min: [0, "Food amount cannot be negative"],
  },
  discount: {
    type: Number,
    min: [0, "Discount cannot be negative"],
  },
  haveGST: {
    type: Boolean,
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

  gstAmount: {
    type: Number,
    min: [0, "Gst Amount cannot be negative"],
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
  hotelId: {
    type: mongoose.Types.ObjectId,
  },
  invoiceNumber: {
    type: String,
    unique: true,
  },
  foodItems: [],
  type: {
    type: String,
    default: "separate_foodbill",
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

// Compile the schema into a model
const SeparateFoodInvoiceSchema = mongoose.model(
  "SeparateFoodInvoice",
  FoodInvoiceSchema
);

module.exports = SeparateFoodInvoiceSchema;
