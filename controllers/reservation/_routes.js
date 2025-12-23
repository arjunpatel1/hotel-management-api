const express = require("express");
const auth = require("../../middelwares/auth");
const reservation = require("./reservation");

const router = express.Router(); 

// ======================= ROUTES =======================

const upload = require("../../middelwares/multer");

router.post(
  "/doreservation",
  auth,
  upload.array("idFile"), 
  reservation.doReservation
);


router.get(
  "/viewallreservations/:hotelId",
  auth,
  reservation.getAllReservations
);

router.get(
  "/viewallreservation",
  reservation.getAllReservationForAdmin
);

router.get(
  "/viewallactivereservations/:hotelId",
  auth,
  reservation.getAllActiveReservations
);

router.get(
  "/viewpendingandactivereservations/:hotelId",
  reservation.getAllPendingAndActiveReservation
);

router.get(
  "/viewactiveandcompletedreservation/:hotelId",
  auth,
  reservation.getAllActiveAndCompletedReservation
);

router.get(
  "/viewallpendingreservations/:hotelId",
  auth,
  reservation.getAllPendingReservations
);

router.get(
  "/viewallcompletedreservations/:hotelId",
  auth,
  reservation.getAllCompleteReservation
);

router.get(
  "/viewcustomerofactivereservation/:hotelId",
  auth,
  reservation.getAllActiveReservationCustomers
);

router.get(
  "/view/:id",
  auth,
  reservation.getSpecificReservation
);

router.patch(
  "/edit/:id",
  auth,
  reservation.editreservation
);

router.patch(
  "/checkin/:id",
  reservation.checkIn
);

router.patch(
  "/delete/:id",
  reservation.deleteReservation
);

module.exports = router;

