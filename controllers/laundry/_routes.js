const express = require("express");
const controller = require("./laundry");
const auth = require("../../middelwares/auth");

const router = express.Router();

router.post("/add", auth, controller.addItems);
router.get("/viewall/:hotelId", auth, controller.getAllItems);

// ✅ ADD THIS
router.get("/view/:id", auth, controller.getLaundryById);

router.patch("/edit/:id", auth, controller.editItem);
router.delete("/delete/:id", auth, controller.deleteItem);

module.exports = router;
