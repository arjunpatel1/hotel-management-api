const mongoose = require('mongoose');

const logoSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  url: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Logo = mongoose.model('Logo', logoSchema);

module.exports = Logo;
