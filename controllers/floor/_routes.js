const express = require("express");
const router = express.Router();
const floor = require("./floors");


router.post("/add", floor.add);


router.get("/view/:hotelId", floor.getAll);


router.patch("/update/:id", floor.update);


router.delete("/delete/:id", floor.delete);

module.exports = router;
