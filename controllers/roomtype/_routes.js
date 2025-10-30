const express = require("express");
const roomtype = require("./roomstypes");
const router = express.Router();

router.post("/add", roomtype.add);
router.get("/view/:id",roomtype.getAllRoomTypes);

module.exports = router;