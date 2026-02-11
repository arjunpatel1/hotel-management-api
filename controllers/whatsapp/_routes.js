const express = require('express');
const router = express.Router();
const whatsappController = require('./whatsapp');

router.post('/send', whatsappController.sendWhatsApp);

module.exports = router;