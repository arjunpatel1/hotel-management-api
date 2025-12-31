const express = require("express");
const router = express.Router();

const controller = require("./laundryItem"); // ✅ path must be correct

router.post("/add", controller.add);
router.get("/view/:id", controller.getAll);
router.patch("/update/:id", controller.update);
router.delete("/delete/:id", controller.delete);

module.exports = router;


