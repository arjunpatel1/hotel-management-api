const express = require("express");
const controller = require("./laundry");
const laundryInvoiceController = require("./laundryinvoice");
const auth = require("../../middelwares/auth");
const router = express.Router();

router.post("/add", auth, controller.addItems);
router.get("/viewall/:hotelId", auth, controller.getAllItems);
router.get("/view/:id", auth, controller.getLaundryById);
router.patch("/edit/:id", auth, controller.editItem);
router.delete("/delete/:id", auth, controller.deleteItem);


router.post(
  "/invoice/create",
  auth,
  laundryInvoiceController.createInvoice
);

router.get(
  "/invoice/view/:id",
  auth,
  laundryInvoiceController.getInvoiceById
);

router.delete(
  "/invoice/delete/:id",
  auth,
  laundryInvoiceController.deleteInvoice
);

module.exports = router;
