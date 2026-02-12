const express = require('express');
const router = express.Router();

const controller = require('./onlineReservation');

// GET LIST
router.get(
  '/list/:hotelId',
  controller.getOnlineReservations
);

// DELETE (BULK)
router.delete(
  '/delete',
  controller.deleteOnlineReservations
);

// EXPORT
router.get(
  '/export/:hotelId',
  controller.exportOnlineReservations
);

// EDIT
router.patch(
  '/edit/:id',
  controller.editOnlineReservation
);

module.exports = router;

