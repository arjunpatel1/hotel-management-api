const Floor = require("../../model/schema/Floor.schema");

// ADD FLOOR
exports.add = async (req, res) => {
  try {
    let { name, hotelId } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Floor name is required" });
    }

    name = name.trim();

    const exists = await Floor.findOne({ name, hotelId });

    if (exists) {
      return res.status(400).json({ error: "Floor already exists" });
    }

    const newFloor = new Floor({
      name,
      status: "Pending",
      hotelId
    });

    await newFloor.save();

    res.status(201).json(newFloor);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to add floor" });
  }
};

// GET ALL FLOORS
exports.getAll = async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    const floors = await Floor.find({ hotelId });

    res.status(200).json(floors);
  } catch {
    res.status(500).json({ error: "Failed to fetch floors" });
  }
};

// UPDATE FLOOR
exports.update = async (req, res) => {
  try {
    const { name, status, hotelId } = req.body;

    const duplicate = await Floor.findOne({
      name: name.trim(),
      hotelId,
      _id: { $ne: req.params.id },
    });

    if (duplicate) {
      return res.status(400).json({ error: "Floor already exists" });
    }

    const updated = await Floor.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Floor not found" });
    }

    res.status(200).json(updated);
  } catch {
    res.status(500).json({ error: "Failed to update floor" });
  }
};

// DELETE FLOOR
exports.delete = async (req, res) => {
  try {
    const deleted = await Floor.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Floor not found" });
    }

    res.status(200).json({ message: "Floor deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete floor" });
  }
};

