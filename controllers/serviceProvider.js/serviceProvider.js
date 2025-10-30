const serveProvider = require("../../model/schema/serviceProvider");
const mongoose = require("mongoose");


const add = async (req, res) => {
  try {
    req.body.createdDate = new Date();

    const serveProviderObject = await serveProvider.create(req.body);
    if (serveProviderObject) {
      res.status(200).json(serveProviderObject);
    } else {
      res.status(400).json({ error: "Failed to add Service Provider" });
    }
  } catch (err) {
    console.error("Failed to Service Provider:", err);
    res.status(400).json({ error: "Failed to Service Provider" });
  }

};

const getAllService = async (req, res) => {
  const hotelId = req.params.hotelId;

  try {
    const serveProviderdata = await serveProvider.find({ hotelId });
    if (!serveProviderdata)
      return res.status(404).json({ message: "no Data Found." });
    res.status(200).json({ serveProviderdata });
  } catch (error) {
    console.error("Failed to fetch service provider data:", error);
    res.status(400).json({ error: "Failed to fetch service provider data" });
  }
};

const editServiceprovider = async(req,res) =>{
  console.log("in editItem controller ..... ======>",req.params.id);
  console.log("req.body ..... ======>",req.body);

  try {
    let result = await serveProvider.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to Update service provider data:", err);
    res.status(400).json({ error: "Failed to Update service provider data" });
  }

}

const deleteItem = async (req, res) => {
  try {
    const item = await serveProvider.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "done", item });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

module.exports = {
  add,
  getAllService,
  editServiceprovider,
  deleteItem
};