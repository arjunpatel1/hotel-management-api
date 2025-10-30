const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    emailAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      enum: ["General Inquiry", "Support", "Feedback", "Other"],
      default: "General Inquiry",
    },
    message: {
      type: String,
      required: true,
    },
    hotelId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
