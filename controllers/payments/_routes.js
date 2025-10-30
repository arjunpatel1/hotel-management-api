const express = require("express");
const Payment = require("./payments");
const auth = require("../../middelwares/auth");


const router = express.Router();

router.get("/list", auth, Payment.getPayment);
router.get("/totalPayment", Payment.getTotalPayment);
router.post("/add", Payment.add);
router.put("/edit/:id", Payment.edit);
router.delete("/delete/:id", Payment.deleteData);


router.post("/paypalTrans", Payment.createOnlineTransaction)

module.exports = router;
