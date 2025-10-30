const express = require("express");
const rating = require("./rating");
const auth = require("../../middelwares/auth");

const router = express.Router();

router.post("/add", rating.addItems);
router.get("/viewallratings/:hotelId", rating.getAllRatings);
router.delete("/viewallratings/:id", rating.deleteRatingData);

module.exports = router;
