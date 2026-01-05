const Laundry = require("../../model/schema/laundry");

/* ADD */
// exports.addItems = async (req, res) => {
//   try {
//     const {
//       providerId,
//       roomNumber,
//       items,
//       hotelId,
//       dueDate,
//       advanceAmount = 0,
//       discount = 0,
//       gstPercent = 0
//     } = req.body;

//     if (!providerId || !items?.length || !hotelId) {
//       return res.status(400).json({ error: "Required fields missing" });
//     }

//     /* MAP ITEMS */
//     const mappedItems = items.map(i => ({
//       laundryItemId: i.laundryItemId,
//       itemName: i.itemName,
//       pricingType: i.pricingType,
//       price: i.price,
//       quantity: i.quantity,
//       totalAmount: i.price * i.quantity
//     }));

//     /* ✅ CALCULATIONS (INSIDE FUNCTION) */
//     const subTotal = mappedItems.reduce(
//       (sum, i) => sum + i.totalAmount,
//       0
//     );

//     const gstAmount = (subTotal * gstPercent) / 100;
//     const grandTotal = subTotal + gstAmount - discount;
//     const balanceAmount = grandTotal - advanceAmount;

//     /* CREATE DOCUMENT */
//     const laundry = new Laundry({
//       providerId,
//       hotelId,
//       roomNumber: roomNumber || null,
//       items: mappedItems,

//       subTotal,
//       advanceAmount,
//       discount,
//       gstAmount,
//       grandTotal,
//       totalPaid: advanceAmount,
//       balanceAmount,

//       dueDate,
//       status: "Pending",
//       invoiceNo: `INV-${Date.now()}`
//     });

//     await laundry.save();

//     res.status(200).json(laundry);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to add laundry" });
//   }
// };

exports.addItems = async (req, res) => {
  const { providerId, roomNumber, items, hotelId, dueDate } = req.body;

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
      .populate("invoice") // ✅ THIS WAS MISSING
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





