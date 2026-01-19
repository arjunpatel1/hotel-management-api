const Invoice = require("../../model/schema/Invoice");
const mongoose = require("mongoose");
const Reservation = require("../../model/schema/reservation");

const addItems = async (req, res) => {
  try {
    req.body.createdDate = new Date();

    if (req.body.reservationId) {
      const reservation = await Reservation.findById(req.body.reservationId);
      if (reservation && reservation.foodItems) {
        const filteredFoodItems = reservation.foodItems.filter(
          (item) => !item.status || item.status.toLowerCase() === "delivered"
        );
        req.body.foodItems = filteredFoodItems;
      }
    }

    const InvoiceObject = await Invoice.create(req.body);
    if (InvoiceObject) {
      res.status(200).json(InvoiceObject);
    } else {
      res.status(400).json({ error: "Failed to Add Invoice" });
    }
  } catch (err) {
    console.error("Failed to add Invoice:", err);
    res.status(400).json({ error: "Failed to Add Invoice" });
  }
};

//view all item api-------------------------
const getInvoiceByInvoiceId = async (req, res) => {
  const _id = new mongoose.Types.ObjectId(req.params.id);

  try {
    const InvoiceData = await Invoice.aggregate([
      { $match: { _id } },
      {
        $lookup: {
          from: "reservations",
          localField: "reservationId",
          foreignField: "_id",
          as: "reservation",
        },
      },
      {
        $addFields: {
          FinalCheckInTime: {
            $arrayElemAt: ["$reservation.FinalCheckInTime", 0],
          },
          FinalCheckOutTime: {
            $arrayElemAt: ["$reservation.FinalCheckOutTime", 0],
          },
          paymentOption: {
            $arrayElemAt: ["$reservation.paymentOption", 0],
          },
          advancePaymentMethod: {
            $arrayElemAt: ["$reservation.advancePaymentMethod", 0],
          },
        },
      },
      { $unset: "reservation" },
    ]);

    if (!InvoiceData || InvoiceData.length === 0) {
      return res.status(404).json({ message: "No Data Found." });
    }

    res.status(200).json({ InvoiceData: InvoiceData[0] });
  } catch (error) {
    console.error("Failed to fetch Invoice data:", error);
    res.status(400).json({ error: "Failed to fetch Invoice data" });
  }
};
const getSpecificInvoice = async (req, res) => {
  const reservationId = new mongoose.Types.ObjectId(req.params.reservationId);
  try {
    const InvoiceData = await Invoice.aggregate([
  { $match: { reservationId } },

  {
    $project: {
      reservationId: 1,
      hotelId: 1,
      name: 1,
      address: 1,
      customerPhoneNumber: 1,
      type: 1,
      invoiceNumber: 1,

      roomRent: 1,
      foodAmount: 1,
      laundryAmount: 1,
      laundryInvoiceId: 1,
      discount: 1,
      totalAmount: 1,
      pendingAmount: 1,
      advanceAmount: 1,
      paymentMethod: 1,
      createdDate: 1
    }
  }
]);

    if (InvoiceData.length === 0)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ InvoiceData });
  } catch (error) {
    console.error("Failed to fetch Invoice data:", error);
    res.status(400).json({ error: "Failed to fetch Invoice data" });
  }
};

//delete specific item api----------------
const deleteItem = async (req, res) => {
  try {
    const item = await Invoice.deleteOne({
      _id: req.params.id,
    });
    res.status(200).json({ message: "done", item });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

const editItem = async (req, res) => {
  try {
    let result = await Invoice.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to Update Invoice:", err);
    res.status(400).json({ error: "Failed to Update Invoice" });
  }
};

const viewAllItem = async (req, res) => {
  console.log("req.params.id", req.params.id);
  const hotelid = new mongoose.Types.ObjectId(req.params.id);
  try {
    console.error("in viewAllItem");
    const invoiceData = await Invoice.aggregate([
      { $match: { hotelId: hotelid } },
      {
        $lookup: {
          from: "reservations",
          localField: "reservationId",
          foreignField: "_id",
          as: "reservationData",
        },
      },
      {
        $addFields: {
          FinalCheckInTime: {
            $arrayElemAt: ["$reservationData.FinalCheckInTime", 0],
          },
          FinalCheckOutTime: {
            $arrayElemAt: ["$reservationData.FinalCheckOutTime", 0],
          },
        },
      },
      { $unset: "reservation" },
    ]);

    console.log("invoiceData ====================>", invoiceData);
    res.status(200).json({ invoiceData });
  } catch (err) {
    console.error("Failed to View Invoice:", err);
  }
};

module.exports = {
  addItems,
  deleteItem,
  editItem,
  getSpecificInvoice,
  getInvoiceByInvoiceId,
  viewAllItem,
};
