const express = require("express");
const router = express.Router();

const controller = require("./invoice");

// CREATE
router.post("/create", controller.createLaundryInvoice);

// VIEW
router.get(
  "/view/:id",
  controller.viewSpecificLaundryInvoice
);
router.get('/by-reservation/:reservationId', controller.viewLaundryByReservation);

module.exports = router;

