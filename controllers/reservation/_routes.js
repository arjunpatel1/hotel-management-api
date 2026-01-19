const express = require("express");
const auth = require("../../middelwares/auth");
const reservation = require("./reservation");

const router = express.Router();

// ======================= ROUTES =======================

const customer = require("../customer/customer");

router.post(
  "/doreservation",
  auth,
  customer.upload.array("idFile"),
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

router.delete(
  "/delete/:id",
  reservation.deleteReservation
);

// ======================= FOOD ITEM ROUTES =======================
router.get(
  "/getfooditems/:id",
  auth,
  reservation.getFoodItems
);
router.patch(
  "/addfooditems/:id",
  auth,
  reservation.editFoodItems
);
router.patch(
  "/updatefoodquantity/:id",
  auth,
  reservation.updateFoodQuantity
);

router.patch(
  "/deletefooditem/:id",
  auth,
  reservation.deleteFoodItems
);

router.patch(
  "/addextrastaycharges/:id",
  auth,
  reservation.addExtraStayCharges
);

router.get(
  "/viewbydate/:hotelId/:startDateTime/:endDateTime/:paymentMode",
  auth,
  reservation.getReservationsByDate
);

module.exports = router;

