const express = require("express");
const customer = require("./customer");
const auth = require("../../middelwares/auth");

const router = express.Router();

router.post(
  "/add",
  auth,
  customer.upload.fields([
    { name: "idFile", maxCount: 1 },
    { name: "idFile2", maxCount: 1 },
  ]),
  customer.addItems
);


router.post(
  "/doreservation",
  // auth,
  customer.upload.array("idFile"),
  customer.doReservation
);
router.get("/viewallcustomer/:hotelId", customer.getAllItems);

router.get("/viewallcustomer", customer.getAllCustomers);
router.get("/view/:phone", auth, customer.getSpecificCustomer);
router.delete("/delete/:phone", auth, customer.deleteItem);
router.patch(
  "/editcustomer/:id",
  auth,
  customer.upload.fields([
    { name: "idFile", maxCount: 1 },
    { name: "idFile2", maxCount: 1 },
  ]),
  customer.editcustomer
);
router.post(
  "/doreservationOnline",
  // auth,
  customer.upload.array("idFile"),
  customer.doReservationOnline
);
// router.patch("/edit/:id", customer.editShift);

router.get("/history/:customerObjId", auth, customer.reservationHistory);

module.exports = router;
