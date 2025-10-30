const express = require("express");
const auth = require("../../middelwares/auth");
const contactMsg = require("./contactmsg");

const router = express.Router();

router.post("/add", contactMsg.addContactMessage);
router.get("/viewallcontactmsg/:hotelId", contactMsg.getAllMessages);
router.delete("/deletecontactmsg/:id", contactMsg.deleteUserData);


module.exports = router;
