const Reservation = require("../../model/schema/reservation");

const addLaundryItems = async (req, res) => {
  try {
    const laundryItems = Array.isArray(req.body)
      ? req.body
      : [req.body];

    await Reservation.updateOne(
      { _id: req.params.id },
      { $push: { laundryItems: { $each: laundryItems } } }
    );

    res.json({ message: "Laundry items added successfully" });
  } catch (err) {
    console.error("Laundry add error:", err);
    res.status(400).json({ error: "Failed to add laundry items" });
  }
};

module.exports = {
  addLaundryItems
};
