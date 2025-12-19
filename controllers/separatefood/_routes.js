const express = require("express");
const Invoice = require("./invoice");
const auth = require("../../middelwares/auth");

const router = express.Router();

router.post("/add", Invoice.addItems);
router.get("/viewspecificinvoice/:id", Invoice.getInvoiceByInvoiceId);
router.get("/view/:hotelId", Invoice.getAllInvoices);
router.patch("/edit/:id", auth, Invoice.editItem);
router.post("/deletemany", auth, Invoice.deleteManyInvoices); // 🟢 ADDED

module.exports = router;
