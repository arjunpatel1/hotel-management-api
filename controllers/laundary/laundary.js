const laundary = require("../../model/schema/laundary");
const mongoose = require("mongoose");

const addItems = async (req, res) => {
  try {
    req.body.createdDate = new Date();

    const laundaryObject = await laundary.create(req.body);
    if (laundaryObject) {
      res.status(200).json(laundaryObject);
    } else {
      res.status(400).json({ error: "Failed to Add item" });
    }
  } catch (err) {
    console.error("Failed to add item:", err);
    res.status(400).json({ error: "Failed to Add item" });
  }
};

//view all item api-------------------------
const getAllItems = async (req, res) => {
  const hotelId = req.params.hotelId;

  try {
    const laundaryData = await laundary.find({ hotelId });
    if (!laundaryData)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ laundaryData });
  } catch (error) {
    console.error("Failed to fetch Laundary data:", error);
    res.status(400).json({ error: "Failed to fetch Laundary data" });
  }
};
const getAllLaundaryExpenses = async (req, res) => {
  const hotelId = req.params.hotelId;

  try {
    let laundaryData = await laundary.find({ hotelId, status: true });

    if (!laundaryData || laundaryData.length === 0) {
      return res.status(404).json({ message: "No Data Found." });
    }

    // Group laundary expenses by date and calculate total amount for each date
    const laundaryDataGroupedByDate = {};
    laundaryData.forEach((item) => {
      const dateKey = item.createdDate.toISOString().split("T")[0]; // Extract date without time
      if (!laundaryDataGroupedByDate[dateKey]) {
        laundaryDataGroupedByDate[dateKey] = {
          category: "laundary",
          amount: 0,
          createdDate: item.createdDate,
        };
      }
      const amount = item.quantity * item.amount;
      laundaryDataGroupedByDate[dateKey].amount += amount;
    });

    // Convert object to array of values
    const result = Object.values(laundaryDataGroupedByDate);

    res.status(200).json({ laundaryData: result });
  } catch (error) {
    console.error("Failed to fetch Laundary data:", error);
    res.status(400).json({ error: "Failed to fetch Laundary data" });
  }
};

//delete specific item api----------------
const deleteItem = async (req, res) => {
  try {
    const item = await laundary.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "done", item });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

const editItem = async (req, res) => {
  console.log("in editItem controller ..... ======>",req.params.id);
  console.log("req.body ..... ======>",req.body);

  
  try {
    let result = await laundary.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to Update Laundary:", err);
    res.status(400).json({ error: "Failed to Update Laundary" });
  }
};

module.exports = {
  addItems,
  deleteItem,
  getAllItems,
  editItem,
  getAllLaundaryExpenses,
};
