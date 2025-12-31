const express = require("express");
const Invoice = require("./singleinvoice");
const auth = require("../../middelwares/auth");
const router = express.Router();

router.post("/add", Invoice.addItems);
router.get("/view/:reservationId", auth, Invoice.getSpecificInvoice);
router.delete("/delete/:id", Invoice.deleteItem);
router.put("/edit/:id", Invoice.editItem);


module.exports = router;
