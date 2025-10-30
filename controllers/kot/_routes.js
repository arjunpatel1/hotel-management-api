const express = require("express");
const kot = require("./kot");
const auth = require("../../middelwares/auth");


const router = express.Router();

router.post("/addKot", auth, kot.addTicket);
router.get("/viewallKot/:hotelId",auth,kot.viewAllTicket);
router.patch("/editKot/:id", auth, kot.editTicket);
router.delete("/deleteKot/:id", auth, kot.deleteTicket);

module.exports = router;
