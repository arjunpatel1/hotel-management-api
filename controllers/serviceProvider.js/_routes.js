const express = require("express");
const serviceprovider =  require("./serviceProvider");
const auth = require('../../middelwares/auth')

const router = express.Router();

router.post("/addService",auth, serviceprovider.add);
router.get("/getAll/:id",auth, serviceprovider.getAllService);
router.patch("/edit/:id",auth, serviceprovider.editServiceprovider);
router.delete("/delete/:id",auth, serviceprovider.deleteItem);


module.exports = router;