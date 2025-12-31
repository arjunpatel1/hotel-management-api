const Invoice = require("../../model/schema/separatefoodinvoice");
const mongoose = require("mongoose");

const addItems = async (req, res) => {
  try {
    req.body.createdDate = new Date();

    const foodItems = req.body.foodItems;

    if (!foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
      return res.status(400).json({ error: "No food items provided" });
    }

    const orderId = `ORD-${Date.now()}`;

    const invoiceObject = {
      ...req.body,
      orderId, // ✅ Auto-generate Order ID
      createdDate: req.body.createdDate,
      foodItems: [],
    };

    // If reservationId is provided, fetch roomNo & hotelId from reservation
    if (req.body.reservationId) {
      const Reservation = require("../../model/schema/reservation");
      const reservation = await Reservation.findById(req.body.reservationId);
      if (reservation) {
        if (reservation.roomNo) {
          invoiceObject.roomNumber = reservation.roomNo;
        }
        // Fallback: Use reservation's hotelId if not provided in body
        if (!invoiceObject.hotelId && reservation.hotelId) {
          invoiceObject.hotelId = reservation.hotelId;
        }
      }
    }

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
    const InvoiceData = await Invoice.find({ hotelId }).sort({ createdDate: -1 });
    res.status(200).json({ InvoiceData });
  } catch (error) {
    console.error("Failed to fetch Invoice data:", error);
    res.status(400).json({ error: "Failed to fetch Invoice data" });
  }
};
const deleteManyInvoices = async (req, res) => {
  try {
    console.log("Invoice deleteMany called");
    console.log("Request body:", req.body);

    const ids = req.body.data?.ids;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "Invalid ids format" });
    }

    const result = await Invoice.deleteMany({
      _id: { $in: ids }
    });

    console.log("Delete result:", result);

    res.status(200).json({
      message: "Invoices deleted successfully",
      result
    });
  } catch (error) {
    console.error("Failed to delete invoices:", error);
    res.status(500).json({
      message: "Failed to delete invoices",
      error
    });
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
    const updateData = { ...req.body };
    if (updateData.roomNo !== undefined) {
      updateData.roomNumber = updateData.roomNo;
      delete updateData.roomNo;
    }
    let result = await Invoice.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
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
  deleteManyInvoices,
};
