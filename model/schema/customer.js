const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
  
  },
  firstName: {
    type: String,

  },
  lastName: {
    type: String,
   
  },
  email: {
    type: String,
 
  },
  idCardType: {
    type: String,
  },
  idcardNumber: {
    type: String,
  },
  idFile: {
    type: String,
  },
  idFile2: {
    type: String,
  },
  specialRequests: {
    type: String,
  },
  address: {
    type: String,
  },
  hotelId: {
    type: mongoose.Types.ObjectId,
  },
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  reservations: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Customer", customerSchema);
