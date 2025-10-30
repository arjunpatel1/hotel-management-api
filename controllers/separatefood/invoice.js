const Invoice = require("../../model/schema/separatefoodinvoice");
const mongoose = require("mongoose");

const addItems = async (req, res) => {
  try {
    req.body.createdDate = new Date();

    const foodItems = req.body.foodItems;

    const invoiceObject = {
      ...req.body,
      createdDate: req.body.createdDate,
      foodItems: [],
    };

    foodItems.forEach((item) => {
      invoiceObject.foodItems.push(item);
    });

    const createdInvoice = await Invoice.create(invoiceObject);

    if (createdInvoice) {
      res.status(200).json(createdInvoice);
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
    const InvoiceData = await Invoice.findOne({ _id });
    if (!InvoiceData)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ InvoiceData });
  } catch (error) {
    console.error("Failed to fetch Invoice data:", error);
    res.status(400).json({ error: "Failed to fetch Invoice data" });
  }
};
//view speciific Invoice api-------------------------
const getAllInvoices = async (req, res) => {
  const hotelId = new mongoose.Types.ObjectId(req.params.hotelId);
  try {
    const InvoiceData = await Invoice.find({ hotelId });
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
    const item = await Invoice.deleteOne({ _id: req.params.id });
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
  getAllInvoices,
  getInvoiceByInvoiceId,
};
