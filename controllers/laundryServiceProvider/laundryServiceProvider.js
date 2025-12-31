const LaundryServiceProvider = require("../../model/schema/LaundryServiceProvider");

// ADD
// ADD
exports.add = async (req, res) => {
  try {
    let { name, phone, hotelId } = req.body;

    if (!name || !phone || !hotelId) {
      return res.status(400).json({ error: "Name, Phone & HotelId required" });
    }

    name = name.trim();

    const exists = await LaundryServiceProvider.findOne({ name, hotelId });
    if (exists) {
      return res.status(400).json({ error: "Provider already exists" });
    }

    const provider = new LaundryServiceProvider({
      name,
      phone,                 // ✅ FIXED
      hotelId,
      status: "Pending"      // ✅ default pending
    });

    await provider.save();
    res.status(201).json(provider);

  } catch (err) {
    res.status(500).json({ error: "Failed to add provider" });
  }
};


// GET ALL
exports.getAll = async (req, res) => {
  try {
    const hotelId = req.params.id;

    const list = await LaundryServiceProvider.find({ hotelId });

    res.status(200).json(list); // ⚠️ IMPORTANT (array only)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch providers" });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { name, phone, status, hotelId } = req.body;

    const duplicate = await LaundryServiceProvider.findOne({
      name,
      hotelId,
      _id: { $ne: req.params.id }
    });

    if (duplicate) {
      return res.status(400).json({ error: "Already exists" });
    }

    const updated = await LaundryServiceProvider.findByIdAndUpdate(
      req.params.id,
      { name, phone, status },
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
    await LaundryServiceProvider.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};
