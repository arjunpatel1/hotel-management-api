const express = require('express');
const { postContent, getPageContent } = require('./pageContent');

const router = express.Router();

router.post('/:hotelId', postContent);
router.get('/:hotelId/:page', getPageContent);

module.exports = router;