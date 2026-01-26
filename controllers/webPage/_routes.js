const express = require("express");
const webPage = require("./webPage");

const router = express.Router();

router.post("/addContactus", webPage.contactUs);
router.patch("/editContactus/:id", webPage.updateContactUs);
router.get("/getContact", webPage.getContact);
router.get("/getContact/:id", webPage.getContactUsById);



module.exports = router;
