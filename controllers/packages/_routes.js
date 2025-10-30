const express = require("express");
const Packages = require("./packages");

const router = express.Router();

router.post("/add", Packages.add);
router.get("/getAllPackages", Packages.getList);
router.get("/getspecificpackage/:id", Packages.getSpecificPackage);
router.patch("/delete/:id", Packages.deleteData);
router.patch("/edit/:id", Packages.edit);

module.exports = router;
