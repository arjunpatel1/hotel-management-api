const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  phone: {
    type: String,
    default: '+1 (555) 123-4567'
  },
  phoneNote: {
    type: String,
    default: '24/7 Customer Service'
  },
  email: {
    type: String,
    default: 'info@luxuryhotel.com'
  },
  emailNote: {
    type: String,
    default: "We'll respond within 24 hours"
  },
  address: {
    type: String,
    default: '123 Luxury Street, Premium City, PC 12345, United States'
  },
  frontDeskHours: {
    type: String,
    default: '24 hours a day, 7 days a week'
  },
  frontDeskNote: {
    type: String,
    default: 'Always here to assist you'
  },
  departments: {
    type: Object,
    default: {
      reservations: 'reservations@luxuryhotel.com',
      events: 'events@luxuryhotel.com',
      guestServices: 'concierge@luxuryhotel.com',
      billing: 'billing@luxuryhotel.com'
    }
  }
});

module.exports = mongoose.model('Contact', contactSchema);
