const rating = require("../../model/schema/rating");
const mongoose = require("mongoose");

const addItems = async (req, res) => {
  try {
    const ratingObject = await rating.create(req.body);
    if (ratingObject) {
      res.status(200).json(ratingObject);
    } else {
      res.status(400).json({ error: "Failed to Add item" });
    }
  } catch (err) {
    console.error("Failed to add item:", err);
    res.status(400).json({ error: "Failed to Add item" });
  }
};

const getAllRatings = async (req, res) => {
  const hotelId = req.params.hotelId;

  try {
    const ratingData = await rating.find({ hotelId });
    if (!ratingData) return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ ratingData });
  } catch (error) {
    console.error("Failed to fetch Laundary data:", error);
    res.status(400).json({ error: "Failed to fetch Laundary data" });
  }
};

const deleteRatingData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required." });
    }

    const deletedUser = await rating.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", data: deletedUser });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

module.exports = {
  addItems,
  getAllRatings,
  deleteRatingData,
};
