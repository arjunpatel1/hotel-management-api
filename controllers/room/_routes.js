const express = require("express");
const router = express.Router();
const room = require("./rooms");


router.post(
  "/add",
  room.upload.single("image"),
  room.add
);
router.get("/viewallrooms", room.getAllRooms); // Admin endpoint - all rooms from all hotels (must be before :hotelId)
router.get("/viewallrooms/:hotelId", room.getAll);
router.patch(
  "/edit/:id",
  room.upload.single("image"),
  room.update
);
router.patch(
  "/update-primary/:id",
  room.updatePrimaryPricing
);

router.delete("/delete/:id", room.delete);

module.exports = router;
