const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employeeType: {
    type: String,
    required: true,
  },
  shift: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  idCardType: {
    type: String,
    required: true,
  },
  idcardNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  idFile: {
    type: String,
    required: true,
  },
  idFile2: {
    type: String,
    required: false,
  },
  salary: {
    type: Number,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  currencyCode: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  permissions: {
    type: [String],
    default: [],
  },
});

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
