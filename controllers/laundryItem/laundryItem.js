const LaundryItem = require("../../model/schema/LaundryItem");

/* ADD */
/* ADD */
exports.add = async (req, res) => {
  try {
    const { hotelId, items } = req.body;

    if (!hotelId || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: "Invalid data" });
    }

    // Normalize item names
    const incomingNames = items.map(i =>
      i.name.trim().toUpperCase()
    );

    // 🔍 Check if ANY item name already exists for this hotel
    const existing = await LaundryItem.findOne({
      hotelId,
      "items.name": { $in: incomingNames }
    });

    if (existing) {
      return res.status(400).json({
        error: "Laundry item already exists"
      });
    }

    // ensure only one primary
    let primaryFound = false;
    items.forEach(i => {
      i.name = i.name.trim().toUpperCase(); // normalize
      if (i.isPrimary) {
        if (primaryFound) i.isPrimary = false;
        primaryFound = true;
      }
    });
    if (!primaryFound) items[0].isPrimary = true;

    const doc = new LaundryItem({
      hotelId,
      items,
      status: "Pending"
    });

    await doc.save();

    res.status(201).json({
      message: "Laundry Item added",
      data: doc
    });

  } catch (err) {
    console.error("ADD LAUNDRY ITEM ERROR:", err);
    res.status(500).json({
      error: "Failed to add Laundry Item"
    });
  }
};


/* GET */
exports.getAll = async (req, res) => {
  try {
    const list = await LaundryItem.find({ hotelId: req.params.id });
    res.status(200).json(list);
  } catch {
    res.status(500).json({ error: "Fetch failed" });
  }
};

/* UPDATE */
exports.update = async (req, res) => {
  try {
    const { items, status } = req.body;

    const updatePayload = {};

    if (items && Array.isArray(items)) {
      let primaryFound = false;
      items.forEach(i => {
        if (i.isPrimary) {
          if (primaryFound) i.isPrimary = false;
          primaryFound = true;
        }
      });
      if (!primaryFound && items.length) items[0].isPrimary = true;

      updatePayload.items = items;
    }

    if (status) {
      updatePayload.status = status;
    }

    const updated = await LaundryItem.findByIdAndUpdate(
      req.params.id,
      updatePayload,
      { new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
};

/* DELETE */
exports.delete = async (req, res) => {
  try {
    await LaundryItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
};