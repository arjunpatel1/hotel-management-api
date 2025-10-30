const mongoose = require("mongoose");

const serveProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobileNo: {
    type: Number,
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("serveProvider", serveProviderSchema);
