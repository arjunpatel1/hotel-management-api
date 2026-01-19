const Laundry = require("../../model/schema/laundry");
const SingleInvoice = require("../../model/schema/singleinvoice");

exports.addItems = async (req, res) => {
  const { providerId, roomNumber, items, hotelId, dueDate, reservationId } = req.body;
  const mappedItems = items.map(i => ({
    laundryItemId: i.laundryItemId,
    itemName: i.itemName,
    pricingType: i.pricingType,
    price: i.price,
    quantity: i.quantity,
    totalAmount: i.price * i.quantity
  }));

const laundry = new Laundry({
  providerId,
  hotelId,
  reservationId: reservationId || null,
  roomNumber,
  items: mappedItems,
  dueDate,
  status: "Pending"
});
  await laundry.save();
  res.json(laundry);
};
/* GET ALL */
exports.getAllItems = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const list = await Laundry.find({ hotelId })
      .populate("providerId", "name phone")
      .populate("invoice") 
      .populate({
        path: "items.laundryItemId",
        select: "name"
      });

    res.status(200).json(list);
  } catch (err) {
    console.error("Fetch Laundry Error:", err);
    res.status(500).json({ error: "Failed to fetch laundry" });
  }
};
/* EDIT */
exports.editItem = async (req, res) => {
  const updated = await Laundry.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.status(200).json(updated);
};

/* DELETE */
exports.deleteItem = async (req, res) => {
  await Laundry.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Deleted" });
};

exports.getLaundryById = async (req, res) => {
  try {
    const laundry = await Laundry.findById(req.params.id)
      .populate("providerId", "name phone")
      .populate(
       "hotelId",
       "name address phone gstNumber"
     );
    res.status(200).json(laundry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch laundry" });
  }
};





