const SingleInvoice = require("../../model/schema/singleinvoice");
const mongoose = require("mongoose");

const addItems = async (req, res) => {
  try {
    console.log("body data =>", req.body);

    req.body.createdDate = new Date();
    const InvoiceObject = await SingleInvoice.create(req.body);

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

//view speciific Invoice api-------------------------
const getSpecificInvoice = async (req, res) => {
  const reservationId = new mongoose.Types.ObjectId(req.params.reservationId);
  try {
    const InvoiceData = await SingleInvoice.aggregate([
      { $match: { reservationId } },
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
          extraBedsCharge: {
            $arrayElemAt: ["$reservation.extraBedsCharge", 0],
          },
          extraStayCharge: {
            $arrayElemAt: ["$reservation.extraStayCharge", 0],
          },
        },
      },
      { $unset: "reservation" },
    ]);
    if (InvoiceData.length === 0)
      return res.status(404).json({ message: "no Data Found." });

    console.log("InvoiceData ====>", InvoiceData);
    res.status(200).json({ InvoiceData });
  } catch (error) {
    console.error("Failed to fetch Invoice data:", error);
    res.status(400).json({ error: "Failed to fetch Invoice data" });
  }
};

//delete specific item api----------------
const deleteItem = async (req, res) => {
  try {
    const item = await SingleInvoice.deleteOne({ _id: req.params.id });
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

module.exports = {
  addItems,
  deleteItem,
  editItem,
  getSpecificInvoice,
};
