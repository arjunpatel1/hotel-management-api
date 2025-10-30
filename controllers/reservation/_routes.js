const express = require("express");
const auth = require("../../middelwares/auth");
const reservation = require("./reservation");

const router = express.Router();

router.get(
  "/viewallreservations/:hotelId",
  auth,
  reservation.getAllReservations
);
router.get("/viewallreservation",  reservation.getAllReservationForAdmin);
router.get(
  "/viewallactivereservations/:hotelId",
  auth,
  reservation.getAllActiveReservations
);
router.get(
  "/viewpendingandactivereservations/:hotelId",
  // auth,
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
router.get("/view/:id", auth, reservation.getSpecificReservation);
router.get("/getfooditems/:id", reservation.getFoodItems);
router.patch("/edit/:id", auth, reservation.editreservation);
router.patch("/updatefoodquantity/:id", auth, reservation.updateFoodQuantity);
router.patch("/editfooditems/:id", auth, reservation.editFoodItems);
router.patch("/delete/:id", reservation.deleteReservation);
router.patch("/deletefooditem/:id", reservation.deleteFoodItems);
router.patch("/checkin/:id", reservation.checkIn);
router.get("/viewbydate/:id/:start/:end/:mode",auth,reservation.dailyReport);
router.patch("/addExtraStayCharges/:id", reservation.addExtraStayCharges);


module.exports = router;
