const RoomType = require("../../model/schema/roomtype");

const add = async (req, res) => {
  try {
    let { roomType, hotelId } = req.body;

    if (!roomType || !hotelId) {
      return res.status(400).json({
        error: "Room Type & HotelId required"
      });
    }

    // ✅ NORMALIZE
    roomType = roomType.trim().toUpperCase();

    // ✅ CHECK DUPLICATE
    const existingRoomType = await RoomType.findOne({
      roomType,
      hotelId
    });

    if (existingRoomType) {
      return res.status(400).json({
        error: "Room Type already exists"
      });
    }

    const newType = new RoomType({
      roomType,
      status: "Pending",
      hotelId
    });

    await newType.save();

    res.status(201).json(newType);

  } catch (err) {
    // 🔒 Mongo unique index safety
    if (err.code === 11000) {
      return res.status(400).json({
        error: "Room Type already exists"
      });
    }

    console.error(err);
    res.status(500).json({
      error: "Failed to create Room Type"
    });
  }
};


const getAllRoomTypes = async (req, res) => {
  try {
    const allTypes = await RoomType.find({ hotelId: req.params.id });
    res.status(200).json(allTypes);
  } catch (error) {
    res.status(400).json({ error: "Failed to get Room Types" });
  }
};

const updateRoomType = async (req, res) => {
  try {
    const { roomType, status, hotelId } = req.body;

    // check duplicate (exclude current id)
    const duplicate = await RoomType.findOne({
      roomType,
      hotelId: hotelId,
      _id: { $ne: req.params.id }
    });

    if (duplicate) {
      return res.status(400).json({ error: "Room Type already exists" });
    }

    const updatedRoomType = await RoomType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedRoomType) {
      return res.status(404).json({ error: "Room Type not found" });
    }

    res.status(200).json(updatedRoomType);

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to update Room Type" });
  }
};

const deleteRoomType = async (req, res) => {
  try {
    const deleted = await RoomType.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Room Type not found" });
    }

    res.status(200).json({ message: "Room Type deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Failed to delete Room Type" });
  }
};

module.exports = {
  add,
  getAllRoomTypes,
  updateRoomType,
  deleteRoomType,
};