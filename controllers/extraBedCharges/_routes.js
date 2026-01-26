const express = require("express");
const router = express.Router();

const controller = require("./extraBedCharges");

router.post("/add", controller.add);
router.get("/", controller.getAll);
router.patch("/update/:id", controller.update);
router.delete("/delete/:id", controller.delete);


module.exports = router;

