const express = require("express");
const router = express.Router();
const LaundryController = require("./laundryController");

// POST: add laundry items to reservation
router.post("/add/:id", LaundryController.addLaundryItems);

module.exports = router;
