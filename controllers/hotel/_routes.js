const express = require("express");
const hotel = require("./hotel");
const auth = require("../../middelwares/auth");

const router = express.Router();

router.post("/register", hotel.register);
router.post("/login", hotel.login);
router.get("/viewallhotels", hotel.getAllHotels);
router.get("/viewallhotelreports", hotel.getAllHotelReports);
router.patch("/changehotelstatus/:id/:status", hotel.changeHotelStatus);
router.get("/view/:id", hotel.getSpecificHotel);
router.patch("/delete/:id", hotel.deleteHotel);

// router.patch("/edit/:id", auth, hotel.upload.single("hotelImage"),  hotel.edit);
router.patch("/edit/:id", auth, hotel.upload.single("hotelImage"), hotel.edit);

router.patch("/changehotelpassword", hotel.ChangeHotelPassword);
router.patch("/editCheckInButtonStatus/:id", hotel.ChangeCheckInButtonStatus);
router.patch("/editCheckOutButtonStatus/:id", hotel.ChangeCheckOutButtonStatus);

router.patch("/editcheckinMailStatus/:id", hotel.ChangeCheckInMailButtonStatus);
router.patch("/editcheckOutMailStatus/:id", hotel.ChangeCheckOutMailButtonStatus);
router.patch("/editReservationMailStatus/:id", hotel.ChangeReservationMailButtonStatus);

router.patch("/hotelEmailIdForCustomer/:id", hotel.updateHotelEmailIdForCustomer);


module.exports = router;
