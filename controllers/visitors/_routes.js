const express = require("express");
const visitors = require("./visitors");

const router = express.Router();

router.post("/add", visitors.upload.single("idFile"), visitors.addVisitors);

router.get("/viewallvisitors/:hotelId", visitors.getAllVisitors);
// router.get("/viewallvisitors", visitors.getAllvisitorss);
router.get("/view/:phone", visitors.getSpecificvisitors);
router.delete("/delete/:phone", visitors.deleteItem);
router.patch(
  "/editvisitor/:id",
  visitors.upload.single("idFile"),
  visitors.editvisitors
);
// // router.patch("/edit/:id", visitors.editShift);

module.exports = router;
