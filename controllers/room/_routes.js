const express = require("express");
const room = require("./rooms");
const auth = require("../../middelwares/auth");
const rooms = require("./rooms");

const router = express.Router();

// router.get("/", room.index);
router.get("/viewallrooms/:hotelId", room.getAllRooms);
router.get("/viewallrooms", room.getAllRoomsForAdmin);
router.get(
  "/activroomreservationid/:roomNo",
  auth,
  room.reservedRoomCustomerData
);
// router.get("/viewuserrooms/:createBy", auth, room.getUserrooms);
router.post("/add",auth, rooms.upload.array('images', 4) , room.add);
router.patch("/edit/:id", auth,rooms.upload.array('images', 4), room.edit);
router.delete("/delete/:id", auth, room.deleteData);
router.patch("/editroomstatus/:roomNo", auth, room.editRoomStatus);
// router.post("/createroom", auth, room.createroom);
// router.get("/view/:id", room.view);
// router.post("/deleteMany", auth, room.deleteMany);
// router.get("/exportroom", room.exportroom);

router.get("/viewallvacantrooms/:hotelId", room.getAllVacantRooms);
router.get("/getAllAvailableRooms/:hotelId", room.getAllAvailableRooms);

module.exports = router;
