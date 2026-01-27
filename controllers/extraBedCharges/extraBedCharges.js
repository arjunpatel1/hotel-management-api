const ExtraBedCharges = require("../../model/schema/ExtraBedCharges");
const mongoose = require("mongoose");

// ADD
exports.add = async (req, res) => {
  try {
    const { roomTypeId, chargePerDay, hotelId } = req.body;

    if (!roomTypeId || !chargePerDay || !hotelId) {
      return res.status(400).json({
        error: "Room Type, Price & HotelId required"
      });
    }

    // Prevent duplicate room type per hotel
    const exists = await ExtraBedCharges.findOne({
      roomTypeId,
      hotelId
    });

    if (exists) {
      return res.status(400).json({
        error: "Extra bed charges already added for this room type"
      });
    }

    const data = new ExtraBedCharges({
      roomTypeId,
      chargePerDay,
      hotelId
    });

    await data.save();
    res.status(201).json(data);

  } catch (err) {
    res.status(500).json({ error: "Failed to add extra bed charges" });
  }
};


// GET ALL (Hotel wise)
exports.getAll = async (req, res) => {
  try {
    const { hotelId } = req.query;

    if (!hotelId || !mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({ error: "Invalid hotelId" });
    }

    const list = await ExtraBedCharges.find({
      hotelId: new mongoose.Types.ObjectId(hotelId)
    }).populate("roomTypeId", "roomType");

    res.status(200).json(list);
  } catch (err) {
    console.error("GET EXTRA BED ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};





// UPDATE
exports.update = async (req, res) => {
  try {
    const { roomTypeId, chargePerDay } = req.body;

    // Duplicate check
    const duplicate = await ExtraBedCharges.findOne({
      roomTypeId,
      hotelId: req.body.hotelId,
      _id: { $ne: req.params.id }
    });

    if (duplicate) {
      return res.status(400).json({
        error: "Already exists for this room type"
      });
    }

    const updated = await ExtraBedCharges.findByIdAndUpdate(
      req.params.id,
      { roomTypeId, chargePerDay },
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};


// DELETE
exports.delete = async (req, res) => {
  try {
    await ExtraBedCharges.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};
