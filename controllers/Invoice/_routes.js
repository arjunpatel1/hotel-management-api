const express = require("express");
const Invoice = require("./invoice");
const auth = require("../../middelwares/auth");

const router = express.Router();

router.post("/add", auth, Invoice.addItems);
router.get("/viewspecificinvoice/:id", auth, Invoice.getInvoiceByInvoiceId);
router.get("/view/:reservationId", auth, Invoice.getSpecificInvoice);
router.delete("/delete/:id", auth, Invoice.deleteItem);
router.get("/viewallinvoice/:id", auth, Invoice.viewAllItem);

module.exports = router;
