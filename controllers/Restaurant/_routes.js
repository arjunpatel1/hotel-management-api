const express = require("express");
const restaurant = require("./restaurant");
const { rawListeners } = require("../../model/schema/restaurant");
const auth = require("../../middelwares/auth");

const router = express.Router();

router.post("/add", restaurant.upload.single("itemImage"), auth, restaurant.addItems);
router.get("/viewallitems/:hotelId", auth, restaurant.getAllItems);
router.delete("/delete/:id", auth, restaurant.deleteItem);
router.post("/importitems/:id", auth, restaurant.importItem);
router.patch("/edit/:id",auth, restaurant.upload.single("itemImage"), restaurant.editItem);
router.post("/deletemany", auth, restaurant.deleteManyItem);

module.exports = router;
