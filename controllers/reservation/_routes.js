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

// ✅ Also support DELETE method
router.delete(
  "/delete/:id",
  reservation.deleteReservation
);

// ======================= FOOD ITEM ROUTES =======================
// View all food items in a reservation
router.get(
  "/getfooditems/:id",
  auth,
  reservation.getFoodItems
);
// Add food items to a reservation (Maps to editFoodItems controller)
router.patch(
  "/addfooditems/:id",
  auth,
  reservation.editFoodItems
);
// Update quantity of a specific food item
router.patch(
  "/updatefoodquantity/:id",
  auth,
  reservation.updateFoodQuantity
);
// Delete a food item from a reservation
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

module.exports = router;

