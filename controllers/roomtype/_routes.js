const express = require("express");
const roomtype = require("./roomstypes");
const router = express.Router();

// ADD
router.post("/add", roomtype.add);

// VIEW
router.get("/view/:id", roomtype.getAllRoomTypes);

// UPDATE  
router.patch("/update/:id", roomtype.updateRoomType);

// DELETE
router.delete("/delete/:id", roomtype.deleteRoomType);

module.exports = router;
