const express = require("express");
const router = express.Router();

const roomRoute = require("./room/_routes");
const userRoute = require("./user/_routes");

const roleAccessRoute = require("./roleAccess/_routes");
const restaurant = require("./Restaurant/_routes");
const laundary = require("./laundry/_routes");
const complaint = require("./complaint/_routes");
const expense = require("./expenses/_routes");
const employee = require("./employee/_routes");
const customer = require("./customer/_routes");
const reservation = require("./reservation/_routes");
const invoice = require("./Invoice/_routes");
const singleinvoice = require("./singleinvoice/_routes");
const hotel = require("./hotel/_routes");
const packages = require("./packages/_routes");
const payments = require("./payments/_routes");
const visitors = require("./visitors/_routes");
const separatefoodinvoice = require("./separatefood/_routes");
const uploadImages = require("./uploadImages/_routes");
const serviceProvider = require("./serviceProvider.js/_routes");
const webpageRoute = require("./webPage/_routes");
const ratingRoute = require("./Rating/_routes");

const kot = require("./kot/_routes");
const roomtype = require("./roomtype/_routes");
const contactMsg = require("./contactMsg/_routes");
const pageContent = require("./pageContent/_routes");

router.use("/image", uploadImages);

router.use("/rating", ratingRoute);
router.use("/room", roomRoute);
router.use("/customer", customer);
router.use("/restaurant", restaurant);
router.use("/laundry", require("./laundry/_routes"));

router.use("/complaint", complaint);
router.use("/expenses", expense);
router.use("/employee", employee);
router.use("/reservation", reservation);
router.use("/invoice", invoice);
router.use("/singleinvoice", singleinvoice);
router.use("/hotel", hotel);
router.use("/user", userRoute);
router.use("/packages", packages);
router.use("/payments", payments);
router.use("/visitors", visitors);
router.use("/separatefoodinvoice", separatefoodinvoice);
router.use("/kitchenorderticket", kot);
router.use("/roomtype", roomtype);
router.use("/serviceprovider", serviceProvider);
router.use("/webPage", webpageRoute);
router.use("/contactus", contactMsg);
router.use("/htmlContent", pageContent);

router.use("/bookingtype", require("./bookingtype/_routes"));
router.use("/floor", require("./floor/_routes"));
router.use(
  "/laundryserviceprovider",
  require("./laundryServiceProvider/_routes")
);

router.use(
  "/laundryitem",
  require("./laundryItem/_routes")
);


router.use("/role-access", roleAccessRoute);

module.exports = router;
