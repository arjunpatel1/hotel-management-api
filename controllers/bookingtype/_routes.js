const express = require("express");
const router = express.Router();
const bookingtype = require("./bookingtypes");

router.post("/add", bookingtype.add);
router.get("/view/:id", bookingtype.getAll);
router.patch("/update/:id", bookingtype.update);
router.delete("/delete/:id", bookingtype.delete);

module.exports = router;
