


const express = require("express");
const employee = require("./employee");
const auth = require("../../middelwares/auth");

const router = express.Router();


router.post("/login", employee.loginEmployee);


router.post(
  "/add",
  auth,
  employee.upload.fields([
    { name: "idFile", maxCount: 1 },
    { name: "idFile2", maxCount: 1 }
  ]),
  employee.addItems
);


router.get("/viewallemployee/:hotelId", auth, employee.getAllItems);


router.get("/view/:id", auth, employee.getSpecificEmployee);


router.delete("/delete/:id", auth, employee.deleteItem);


router.patch(
  "/editemployee/:id",
  auth,
  employee.upload.fields([
    { name: "idFile", maxCount: 1 },
    { name: "idFile2", maxCount: 1 }
  ]),
  employee.editEmployee
);


router.patch("/edit/:id", auth, employee.editShift);


router.patch("/addPermissions/:id", auth, employee.addPermissions);


router.patch("/changeEmployePassword", auth, employee.changePasswordForStaff);

module.exports = router;
