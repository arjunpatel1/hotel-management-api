const mongoose = require('mongoose');

const sliderImageSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel', 
   
  },
  images: {
    type: [String],
  }
}, { timestamps: true });

module.exports = mongoose.model('SliderImage', sliderImageSchema);
