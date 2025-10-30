const RoomType = require("../../model/schema/roomtype");

const add = async (req, res) => {
  try {
    let { roomType, hotelId, category } = req.body;
    const existingRoomType = await RoomType.findOne({
      roomType: roomType.toLowerCase().trim(),
      category,
      hotelId,
    });
    if (existingRoomType) {
      return res
        .status(400)
        .json({ error: "Room type already exists for this hotel" });
    }
    const roomData = new RoomType({
      roomType: roomType.toLowerCase().trim(),
      hotelId,
      category,
    });
    await roomData.save();
    res.status(201).json(roomData);
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json({ error: "Failed to create Room Type" });
  }
};

const getAllRoomTypes = async (req, res) => {
  try {
    const allRoomTypes = await RoomType.find({ hotelId: req.params.id });
    console.log("allRoomTypes : ", allRoomTypes);
    res.status(200).json(allRoomTypes);
  } catch (error) {
    console.log("error", error);
    res.status(400).json({ error: "Failed to get all Room Type" });
  }
};

module.exports = {
  add,
  getAllRoomTypes,
};
