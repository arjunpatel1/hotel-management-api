const LaundryServiceProvider = require("../../model/schema/LaundryServiceProvider");

// ADD
// ADD LAUNDRY PROVIDER
exports.add = async (req, res) => {
  try {
    let { name, phone, hotelId } = req.body;

    if (!name || !phone || !hotelId) {
      return res.status(400).json({
        error: "Name, Phone & HotelId required"
      });
    }

    name = name.trim().toUpperCase();
    phone = phone.trim();

    // ✅ CHECK DUPLICATE PHONE (NOT NAME)
    const phoneExists = await LaundryServiceProvider.findOne({
      phone,
      hotelId
    });

    if (phoneExists) {
      return res.status(400).json({
        error: "Phone number already exists"
      });
    }

    // ✅ ALLOW SAME NAME WITH DIFFERENT PHONE
    const provider = new LaundryServiceProvider({
      name,
      phone,
      hotelId,
      status: "Pending"
    });

    await provider.save();

    res.status(201).json({
      message: "Laundry provider added",
      data: provider
    });

  } catch (err) {
    // 🔒 Mongo duplicate safety
    if (err.code === 11000) {
      return res.status(400).json({
        error: "Phone number already exists"
      });
    }

    console.error("ADD LAUNDRY ERROR:", err);
    res.status(500).json({
      error: "Failed to add provider"
    });
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
// UPDATE
exports.update = async (req, res) => {
  try {
    const { name, phone, status, hotelId } = req.body;

    const normalizedName = name.trim().toUpperCase();
    const normalizedPhone = phone.trim();

    // ❌ BLOCK SAME PHONE (EXCEPT SELF)
    const duplicatePhone = await LaundryServiceProvider.findOne({
      phone: normalizedPhone,
      hotelId,
      _id: { $ne: req.params.id }
    });

    if (duplicatePhone) {
      return res.status(400).json({
        error: "Phone number already exists"
      });
    }

    const updated = await LaundryServiceProvider.findByIdAndUpdate(
      req.params.id,
      {
        name: normalizedName,
        phone: normalizedPhone,
        status
      },
      { new: true }
    );

    res.status(200).json(updated);

  } catch (err) {
    res.status(500).json({
      error: "Update failed"
    });
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