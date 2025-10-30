const express = require("express");
const laundary = require("./laundary");
const auth = require("../../middelwares/auth");

const router = express.Router();

router.post("/add", auth, laundary.addItems);
router.get("/viewalllaundaries/:hotelId", auth, laundary.getAllItems);
router.get("/viewlaundaryexpenses/:hotelId", auth, laundary.getAllLaundaryExpenses);
router.delete("/delete/:id", auth, laundary.deleteItem);
router.patch("/edit/:id", auth, laundary.editItem);

module.exports = router;
