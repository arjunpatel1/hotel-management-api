const express = require("express");
const complaint = require("./complaint");
const auth = require("../../middelwares/auth");

const router = express.Router();

router.post("/add", auth, complaint.addItems);
router.get("/viewallcomplaints/:hotelId", auth, complaint.getAllItems);
router.get("/viewallcomplaints", complaint.getAllComplaints);
router.get("/view/:id", auth, complaint.getSpecificComplaint);
router.delete("/delete/:id", auth, complaint.deleteItem);
router.patch("/edit/:id", auth, complaint.editItem);
router.put("/edit/:id", auth, complaint.editItem);
router.patch("/update/:id", auth, complaint.editItem);
router.put("/update/:id", auth, complaint.editItem);
router.patch("/changecomplaintstatus/:id", auth, complaint.editComplaintStatus);

module.exports = router;
