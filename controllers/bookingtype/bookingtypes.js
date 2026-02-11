const BookingType = require("../../model/schema/BookingType.schema");

// ADD BOOKING TYPE
exports.add = async (req, res) => {
  try {
    let { name, hotelId } = req.body;

    if (!name || !hotelId) {
      return res.status(400).json({
        error: "Booking Type & HotelId required"
      });
    }

    // ✅ NORMALIZE
    name = name.trim().toUpperCase();

    const exists = await BookingType.findOne({ name, hotelId });

    if (exists) {
      return res.status(400).json({
        error: "Booking Type already exists"
      });
    }

    const newType = new BookingType({
      name,
      hotelId,
      status: "Pending"
    });

    await newType.save();

    res.status(201).json(newType);

  } catch (err) {
    //  Mongo safety
    if (err.code === 11000) {
      return res.status(400).json({
        error: "Booking Type already exists"
      });
    }

    console.error(err);
    res.status(500).json({
      error: "Failed to add Booking Type"
    });
  }
};

// GET ALL BOOKING TYPES
exports.getAll = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const list = await BookingType.find({ hotelId });

    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ error: "Failed to get Booking Types" });
  }
};

// UPDATE BOOKING TYPE
exports.update = async (req, res) => {
  try {
    let { name, status, hotelId } = req.body;

    //  NORMALIZE
    name = name.trim().toUpperCase();

    const duplicate = await BookingType.findOne({
      name,
      hotelId,
      _id: { $ne: req.params.id }
    });

    if (duplicate) {
      return res.status(400).json({
        error: "Booking Type already exists"
      });
    }

    const updated = await BookingType.findByIdAndUpdate(
      req.params.id,
      { name, status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        error: "Booking Type not found"
      });
    }

    res.status(200).json(updated);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to update Booking Type"
    });
  }
};


// DELETE BOOKING TYPE
exports.delete = async (req, res) => {
  try {
    const deleted = await BookingType.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Booking Type not found" });
    }

    res.status(200).json({ message: "Booking Type deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete Booking Type" });
  }
};
